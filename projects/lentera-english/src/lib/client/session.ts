'use client';
// Authentication on the client. Three modes, decided by the server:
//   supabase : Supabase Auth (email + password) in production
//   embedded : local development accounts served by /api/dev-auth
//   none     : no backend; the app is fully usable as a device-only guest
import { useSyncExternalStore } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface Session {
  userId: string;
  email: string;
  token: string;
}
export interface ServerInfo {
  backend: 'supabase' | 'embedded' | 'none';
  payments: 'manual' | 'live' | 'test' | 'mock' | 'off';
  /** New accounts get a 3-day Premium trial (migration 0021 applied on Supabase). */
  trial?: boolean;
}

const SESSION_KEY = 'lentera.session';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Publishable key (sb_publishable_...) or, for older projects, the legacy anon key.
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let session: Session | null = null;
let info: ServerInfo = { backend: SUPABASE_URL ? 'supabase' : 'none', payments: 'off' };
/** Curriculum version the server reported when this page loaded (null offline or unknown). */
let latestContent: string | null = null;
let ready = false;
let supabase: SupabaseClient | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => (listeners.add(l), () => void listeners.delete(l));

async function client(): Promise<SupabaseClient> {
  if (!supabase) {
    const { createClient } = await import('@supabase/supabase-js');
    supabase = createClient(SUPABASE_URL!, SUPABASE_ANON!);
  }
  return supabase;
}

export async function initSession(): Promise<Session | null> {
  if (ready) return session;
  try {
    const res = await fetch('/api/me');
    if (res.ok) {
      const data = await res.json();
      info = { backend: data.backend, payments: data.payments, trial: data.trial === true };
      localStorage.setItem('lentera.info', JSON.stringify(info));
      latestContent = typeof data.contentVersion === 'string' ? data.contentVersion : null;
    }
  } catch {
    // Offline: reuse what we learned last time.
    try {
      info = JSON.parse(localStorage.getItem('lentera.info') ?? '') as ServerInfo;
    } catch {
      /* keep default */
    }
  }
  if (info.backend === 'supabase' && SUPABASE_URL && SUPABASE_ANON) {
    const sb = await client();
    const { data } = await sb.auth.getSession();
    session = data.session ? { userId: data.session.user.id, email: data.session.user.email ?? '', token: data.session.access_token } : null;
    sb.auth.onAuthStateChange((_event, s) => {
      session = s ? { userId: s.user.id, email: s.user.email ?? '', token: s.access_token } : null;
      emit();
    });
  } else if (info.backend === 'embedded') {
    try {
      session = JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null');
    } catch {
      session = null;
    }
  }
  ready = true;
  emit();
  return session;
}

export async function getToken(): Promise<string | null> {
  if (info.backend === 'supabase' && supabase) {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }
  return session?.token ?? null;
}

async function devAuth(action: 'signup' | 'signin', email: string, password: string, name?: string): Promise<Session> {
  const res = await fetch('/api/dev-auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, email, password, name }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Gagal masuk.');
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  return data as Session;
}

const AUTH_MESSAGES: [RegExp, string][] = [
  [/invalid login credentials/i, 'Email atau kata sandi salah.'],
  [/already registered/i, 'Email ini sudah terdaftar. Silakan masuk.'],
  [/password should be at least/i, 'Kata sandi terlalu pendek (minimal 8 karakter).'],
  [/email not confirmed/i, 'Email belum dikonfirmasi. Periksa kotak masukmu.'],
];
const translate = (m: string) => AUTH_MESSAGES.find(([re]) => re.test(m))?.[1] ?? m;

/** Returns "confirm" when the account needs e-mail confirmation first. */
export async function signUp(email: string, password: string, name: string): Promise<'ok' | 'confirm'> {
  await initSession();
  if (info.backend === 'none') throw new Error('Pendaftaran akun belum tersedia di server ini. Kamu tetap bisa belajar sebagai tamu.');
  if (password.length < 8) throw new Error('Kata sandi minimal 8 karakter.');
  if (info.backend === 'embedded') {
    session = await devAuth('signup', email, password, name);
    emit();
    return 'ok';
  }
  const sb = await client();
  const { data, error } = await sb.auth.signUp({ email, password, options: { data: { display_name: name } } });
  if (error) throw new Error(translate(error.message));
  if (!data.session) return 'confirm';
  session = { userId: data.session.user.id, email, token: data.session.access_token };
  emit();
  return 'ok';
}

export async function signIn(email: string, password: string): Promise<void> {
  // A fast submit can come before the server info has loaded.
  await initSession();
  if (info.backend === 'none') throw new Error('Login akun belum tersedia di server ini. Kamu tetap bisa belajar sebagai tamu.');
  if (info.backend === 'embedded') {
    session = await devAuth('signin', email, password);
  } else {
    const sb = await client();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error || !data.session) throw new Error(translate(error?.message ?? 'Gagal masuk.'));
    session = { userId: data.session.user.id, email, token: data.session.access_token };
  }
  emit();
}

export async function signOut(): Promise<void> {
  if (info.backend === 'supabase' && supabase) await supabase.auth.signOut();
  localStorage.removeItem(SESSION_KEY);
  session = null;
  emit();
}

export const useSession = (): Session | null => useSyncExternalStore(subscribe, () => session, () => null);
export const useServerInfo = (): ServerInfo => useSyncExternalStore(subscribe, () => info, () => info);
export const currentSession = () => session;
export const serverInfo = () => info;
export const latestContentVersion = () => latestContent;

// ───────────── Two-step verification for admins (Rilis 9) ─────────────
// Supabase Auth's authenticator-app factor (TOTP). Once an admin has one,
// /api/admin* only accepts sessions that passed it (aal2). Not available with
// the embedded development backend.
export interface MfaState { supported: boolean; factors: { id: string; name: string }[]; current: 'aal1' | 'aal2' | null; needsCode: boolean }

export async function mfaState(): Promise<MfaState> {
  if (info.backend !== 'supabase' || !SUPABASE_URL || !SUPABASE_ANON) return { supported: false, factors: [], current: null, needsCode: false };
  const sb = await client();
  const [{ data: list }, { data: level }] = await Promise.all([sb.auth.mfa.listFactors(), sb.auth.mfa.getAuthenticatorAssuranceLevel()]);
  const factors = (list?.totp ?? []).filter((f) => f.status === 'verified').map((f) => ({ id: f.id, name: f.friendly_name ?? 'Aplikasi authenticator' }));
  const current = (level?.currentLevel ?? null) as 'aal1' | 'aal2' | null;
  return { supported: true, factors, current, needsCode: factors.length > 0 && current !== 'aal2' };
}

/** Starts adding an authenticator app: returns the QR code (SVG data URL) and the key to type by hand. */
export async function mfaEnroll(): Promise<{ id: string; qr: string; secret: string }> {
  const sb = await client();
  // A previous attempt that was never confirmed would block a new one.
  const { data: list } = await sb.auth.mfa.listFactors();
  for (const f of list?.all ?? []) if (f.factor_type === 'totp' && f.status !== 'verified') await sb.auth.mfa.unenroll({ factorId: f.id });
  const { data, error } = await sb.auth.mfa.enroll({ factorType: 'totp', friendlyName: `Lentera admin ${new Date().toISOString().slice(0, 10)}` });
  if (error || !data) throw new Error(error?.message ?? 'Gagal memulai verifikasi 2 langkah.');
  return { id: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}

/** Checks a 6-digit code; on success this session becomes aal2. */
export async function mfaVerify(factorId: string, code: string): Promise<void> {
  const sb = await client();
  const { error } = await sb.auth.mfa.challengeAndVerify({ factorId, code: code.replace(/\s/g, '') });
  if (error) throw new Error(/invalid|expired/i.test(error.message) ? 'Kode salah atau sudah kedaluwarsa. Masukkan kode yang sedang tampil di aplikasi authenticator.' : error.message);
  const { data } = await sb.auth.getSession();
  if (data.session) {
    session = { userId: data.session.user.id, email: data.session.user.email ?? '', token: data.session.access_token };
    emit();
  }
}

export async function mfaRemove(factorId: string): Promise<void> {
  const sb = await client();
  const { error } = await sb.auth.mfa.unenroll({ factorId });
  if (error) throw new Error(error.message);
  await sb.auth.refreshSession();
}
