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
}

const SESSION_KEY = 'lentera.session';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Publishable key (sb_publishable_...) or, for older projects, the legacy anon key.
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let session: Session | null = null;
let info: ServerInfo = { backend: SUPABASE_URL ? 'supabase' : 'none', payments: 'off' };
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
      info = { backend: data.backend, payments: data.payments };
      localStorage.setItem('lentera.info', JSON.stringify(info));
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
