// Session verification. Production: the bearer token is a Supabase Auth JWT,
// verified by asking Supabase who it belongs to. Development (embedded
// database): a minimal local account system so the full product can run and
// be tested without any external service. It is refused in production builds.
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { backendMode, embeddedDb, supabaseKeyHeaders, supabasePublicKey, supabaseSecretKey } from './db';

const DEV_SECRET = process.env.LENTERA_DEV_SECRET ?? 'lentera-dev-only-secret';
const WEEK = 7 * 86_400_000;

function sign(payload: string): string {
  return createHmac('sha256', DEV_SECRET).update(payload).digest('base64url');
}
function devToken(userId: string): string {
  const payload = `${userId}.${Date.now() + WEEK}`;
  return `dev.${payload}.${sign(payload)}`;
}
function verifyDevToken(token: string): string | null {
  const [tag, userId, exp, sig] = token.split('.');
  if (tag !== 'dev' || !userId || !exp || !sig) return null;
  const expected = Buffer.from(sign(`${userId}.${exp}`));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  return Number(exp) > Date.now() ? userId : null;
}

/**
 * Who is calling, and how strongly they signed in (Rilis 9):
 *   aal  : 'aal2' once a second factor (authenticator app code) was verified this session
 *   mfa  : the account has a verified second factor, so admin work requires aal2
 */
export interface AuthInfo { userId: string; aal: 'aal1' | 'aal2'; mfa: boolean }

/** Claims of a token Supabase has just accepted (only read after that check). */
function claims(token: string): Record<string, unknown> {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8')) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function authFromRequest(req: Request): Promise<AuthInfo | null> {
  const header = req.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token || token.length > 8000) return null;
  const mode = backendMode();
  if (mode === 'embedded') {
    const userId = verifyDevToken(token);
    if (!userId) return null;
    // A token outlives a deleted account; Supabase refuses those, so do the same here.
    const db = await embeddedDb();
    const [found] = await db.query('select 1 from auth.users where id = $1', [userId]);
    return found ? { userId, aal: 'aal1', mfa: false } : null;
  }
  if (mode === 'supabase') {
    const res = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      // The user's own access token is the bearer; the key only identifies the project.
      headers: { apikey: supabasePublicKey() || supabaseSecretKey(), Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const user = (await res.json()) as { id?: string; factors?: { status?: string }[] };
    if (typeof user.id !== 'string') return null;
    // Supabase validated the token's signature above; its aal claim can be trusted now.
    const aal = claims(token).aal === 'aal2' ? 'aal2' : 'aal1';
    const mfa = (user.factors ?? []).some((f) => f.status === 'verified');
    return { userId: user.id, aal, mfa };
  }
  return null;
}

export async function userIdFromRequest(req: Request): Promise<string | null> {
  return (await authFromRequest(req))?.userId ?? null;
}

/** Deletes the sign-in account; every learner table follows by cascade (payments keep, without the person). */
export async function deleteAuthUser(userId: string): Promise<void> {
  const mode = backendMode();
  if (mode === 'embedded') {
    const db = await embeddedDb();
    await db.query('delete from auth.users where id = $1', [userId]);
    return;
  }
  if (mode !== 'supabase') throw new Error('unavailable');
  const res = await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    headers: supabaseKeyHeaders(supabaseSecretKey()),
  });
  if (!res.ok) throw new Error(`auth delete failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
}

// ───────────── Development-only accounts (embedded database) ─────────────
const hash = (password: string, salt = randomBytes(16).toString('hex')) => `${salt}:${scryptSync(password, salt, 32).toString('hex')}`;
function checkPassword(password: string, stored: string): boolean {
  const [salt, digest] = stored.split(':');
  if (!salt || !digest) return false;
  const a = Buffer.from(digest, 'hex');
  const b = scryptSync(password, salt, 32);
  return a.length === b.length && timingSafeEqual(a, b);
}

export interface DevSession { token: string; userId: string; email: string }

/**
 * Local test accounts start WITHOUT the 3-day Premium trial (migration 0021) unless `trial` is
 * asked for, so the end-to-end suites keep testing a Free account by default. Real sign-ups on
 * Supabase always get the trial from the database trigger.
 */
export async function devSignUp(email: string, password: string, name: string, trial = false): Promise<DevSession> {
  if (backendMode() !== 'embedded') throw new Error('unavailable');
  const db = await embeddedDb();
  const clean = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) throw new Error('Format email tidak valid.');
  if (password.length < 8) throw new Error('Kata sandi minimal 8 karakter.');
  if ((await db.query('select 1 from auth.users where email = $1', [clean])).length) throw new Error('Email ini sudah terdaftar. Silakan masuk.');
  const [u] = await db.query<{ id: string }>('insert into auth.users (email, encrypted_password, raw_user_meta_data) values ($1, $2, $3) returning id', [clean, hash(password), JSON.stringify({ display_name: name.trim().slice(0, 40) })]);
  if (!trial) await db.query('update profiles set trial_ends_at = null where id = $1', [u.id]);
  // Convenience for local testing of the CMS: one configured address is admin.
  if (process.env.LENTERA_DEV_ADMIN_EMAIL && clean === process.env.LENTERA_DEV_ADMIN_EMAIL.toLowerCase()) await db.query("update profiles set role = 'admin' where id = $1", [u.id]);
  return { token: devToken(u.id), userId: u.id, email: clean };
}

export async function devSignIn(email: string, password: string): Promise<DevSession> {
  if (backendMode() !== 'embedded') throw new Error('unavailable');
  const db = await embeddedDb();
  const clean = email.trim().toLowerCase();
  const [u] = await db.query<{ id: string; encrypted_password: string }>('select id, encrypted_password from auth.users where email = $1', [clean]);
  if (!u || !checkPassword(password, u.encrypted_password ?? '')) throw new Error('Email atau kata sandi salah.');
  return { token: devToken(u.id), userId: u.id, email: clean };
}
