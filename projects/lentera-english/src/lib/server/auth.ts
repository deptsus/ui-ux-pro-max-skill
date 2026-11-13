// Session verification. Production: the bearer token is a Supabase Auth JWT,
// verified by asking Supabase who it belongs to. Development (embedded
// database): a minimal local account system so the full product can run and
// be tested without any external service. It is refused in production builds.
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { backendMode, embeddedDb } from './db';

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

export async function userIdFromRequest(req: Request): Promise<string | null> {
  const header = req.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return null;
  const mode = backendMode();
  if (mode === 'embedded') return verifyDevToken(token);
  if (mode === 'supabase') {
    const res = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!, Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const user = (await res.json()) as { id?: string };
    return typeof user.id === 'string' ? user.id : null;
  }
  return null;
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

export async function devSignUp(email: string, password: string, name: string): Promise<DevSession> {
  if (backendMode() !== 'embedded') throw new Error('unavailable');
  const db = await embeddedDb();
  const clean = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) throw new Error('Format email tidak valid.');
  if (password.length < 8) throw new Error('Kata sandi minimal 8 karakter.');
  if ((await db.query('select 1 from auth.users where email = $1', [clean])).length) throw new Error('Email ini sudah terdaftar. Silakan masuk.');
  const [u] = await db.query<{ id: string }>('insert into auth.users (email, encrypted_password, raw_user_meta_data) values ($1, $2, $3) returning id', [clean, hash(password), JSON.stringify({ display_name: name.trim().slice(0, 40) })]);
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
