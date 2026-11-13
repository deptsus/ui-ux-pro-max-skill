'use client';
import { getToken } from './session';

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export async function api<T>(path: string, opts: { method?: string; body?: unknown; auth?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (opts.auth !== false) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  let res: Response;
  try {
    res = await fetch(path, { method: opts.method ?? (opts.body === undefined ? 'GET' : 'POST'), headers, body: opts.body === undefined ? undefined : JSON.stringify(opts.body) });
  } catch {
    throw new ApiError(0, 'offline', 'Tidak ada koneksi internet.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.code ?? 'error', data.error ?? 'Terjadi kesalahan.');
  return data as T;
}
