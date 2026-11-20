import type { RawDb } from '@/lib/server/db';

/**
 * Creates an auth user; the on_auth_user_created trigger adds the profile. Since migration 0021
 * that trigger also starts a 3-day Premium trial; test users start without it (as accounts made
 * before 0021) unless `trial` is true, so older tests keep testing Free accounts.
 */
export async function newUser(d: RawDb, name: string, role: 'student' | 'admin' = 'student', trial = false): Promise<string> {
  const [u] = await d.query<{ id: string }>("insert into auth.users (email, raw_user_meta_data) values ($1, $2) returning id", [`${name}-${Math.random().toString(36).slice(2)}@example.test`, JSON.stringify({ display_name: name })]);
  if (role === 'admin') await d.query("update profiles set role = 'admin' where id = $1", [u.id]);
  if (!trial) await d.query('update profiles set trial_ends_at = null where id = $1', [u.id]);
  return u.id;
}

