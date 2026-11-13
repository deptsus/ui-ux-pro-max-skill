-- Access control.
-- The browser never writes to the database directly. All writes go through
-- SECURITY DEFINER functions that only the service role may execute, called
-- from the application's API routes after the user's session is verified.
-- RLS is the second line of defence: even with the public anon key, a client
-- can read only its own rows and can change nothing.

do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
  end loop;
end $$;

-- Reference data anyone may read.
grant select on cefr_levels, subscription_plans, achievements to anon, authenticated;
create policy "public read" on cefr_levels for select using (true);
create policy "public read" on subscription_plans for select using (is_active);
create policy "public read" on achievements for select using (true);

-- A signed-in user may read their own rows. No insert/update/delete policies
-- exist, so status, role and entitlement can never be changed from a client.
do $$
declare t text;
begin
  foreach t in array array[
    'exercise_attempts','mastery_records','review_schedules','review_history','lesson_progress',
    'learning_history','xp_transactions','streaks','user_achievements','learner_snapshots',
    'subscriptions','payment_transactions'
  ] loop
    execute format('grant select on table public.%I to authenticated', t);
    execute format('create policy "own rows" on public.%I for select to authenticated using (user_id = auth.uid())', t);
  end loop;
end $$;

grant select on profiles to authenticated;
create policy "own profile" on profiles for select to authenticated using (id = auth.uid());

-- Curriculum tables, curriculum_versions and payment_webhook_events have no
-- policies at all: premium lesson content and gateway logs are reachable only
-- through the server.

-- New functions are not executable by API roles unless granted explicitly.
alter default privileges in schema public revoke execute on functions from public;
alter default privileges in schema public revoke execute on functions from anon, authenticated;
