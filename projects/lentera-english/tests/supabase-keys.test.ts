// Supabase accepts two key formats, sent differently (see src/lib/server/db.ts).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { backendMode, supabaseKeyHeaders, supabasePublicKey, supabaseSecretKey } from '@/lib/server/db';

afterEach(() => vi.unstubAllEnvs());

describe('Supabase keys', () => {
  it('sends new opaque keys only in the apikey header', () => {
    expect(supabaseKeyHeaders('sb_secret_abc')).toEqual({ apikey: 'sb_secret_abc' });
  });
  it('sends legacy JWT keys in both apikey and Authorization', () => {
    expect(supabaseKeyHeaders('eyJhbGciOi.x.y')).toEqual({ apikey: 'eyJhbGciOi.x.y', Authorization: 'Bearer eyJhbGciOi.x.y' });
  });
  it('prefers the new variable names and falls back to the legacy ones', () => {
    vi.stubEnv('SUPABASE_SECRET_KEY', '');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'legacy-service');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'legacy-anon');
    expect([supabaseSecretKey(), supabasePublicKey()]).toEqual(['legacy-service', 'legacy-anon']);
    vi.stubEnv('SUPABASE_SECRET_KEY', 'sb_secret_new');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_new');
    expect([supabaseSecretKey(), supabasePublicKey()]).toEqual(['sb_secret_new', 'sb_publishable_new']);
  });
  it('an explicit embedded backend wins over Supabase variables', () => {
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SECRET_KEY', 'sb_secret_new');
    vi.stubEnv('LENTERA_BACKEND', 'embedded');
    expect(backendMode()).toBe('embedded');
    vi.stubEnv('LENTERA_BACKEND', '');
    expect(backendMode()).toBe('supabase');
  });
  it('turns on the Supabase backend with either secret key name', () => {
    vi.stubEnv('LENTERA_BACKEND', '');
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
    vi.stubEnv('SUPABASE_SECRET_KEY', 'sb_secret_new');
    expect(backendMode()).toBe('supabase');
    vi.stubEnv('SUPABASE_SECRET_KEY', '');
    expect(backendMode()).not.toBe('supabase');
  });
});
