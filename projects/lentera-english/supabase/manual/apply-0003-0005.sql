-- Lentera English: migrasi 0003, 0004, 0005 dalam satu kali jalan.
--
-- Cara pakai (proyek Supabase "Lentera english", ref jewotwcnnvjrvxcflamn):
--   Supabase → SQL Editor → New query → tempel SELURUH isi berkas ini → Run.
-- Hasil yang benar: baris terakhir menampilkan "OK: 3 migrasi terpasang".
--
-- Semuanya berjalan dalam satu transaksi: bila satu perintah gagal, tidak ada
-- yang berubah dan berkas ini bisa dijalankan ulang setelah diperbaiki.
-- Isinya identik dengan supabase/migrations/0003_functions.sql,
-- 0004_payments.sql dan 0005_manual_qris.sql (dibuat oleh skrip, jangan diedit).

begin;

-- ═════════════════════════ 0003_functions ═════════════════════════
-- Server-side functions: accounts, progress sync, leaderboard, CMS.
-- Every function returns jsonb and is callable only by the service role.

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, display_name)
  values (new.id, left(coalesce(nullif(btrim(new.raw_user_meta_data->>'display_name'), ''), 'Pelajar'), 40))
  on conflict (id) do nothing;
  insert into streaks (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

create or replace function assert_admin(p_actor uuid) returns void
language plpgsql stable security definer set search_path = public as $$
begin
  if not exists (select 1 from profiles where id = p_actor and role = 'admin') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
end $$;

-- Premium is derived from subscription periods and the clock, never from a
-- stored flag: when the last period ends the account is Free again by itself.
create or replace function get_entitlement(p_user uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  -- Renewal periods are stacked end to end, so the furthest expiry among
  -- periods that have not ended yet is when premium really stops.
  select case when m.expires_at is null
    then jsonb_build_object('premium', false, 'plan', 'free', 'expires_at', null)
    else jsonb_build_object('premium', true, 'expires_at', m.expires_at,
           'plan', (select s.plan_id from subscriptions s where s.user_id = p_user and s.expires_at > now() order by s.starts_at limit 1))
  end
  from (select max(expires_at) as expires_at from subscriptions where user_id = p_user and expires_at > now()) m;
$$;

create or replace function get_account(p_user uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id) values (p_user) on conflict (id) do nothing;
  insert into streaks (user_id) values (p_user) on conflict (user_id) do nothing;
  return jsonb_build_object(
    'profile', (select to_jsonb(p) from profiles p where p.id = p_user),
    'entitlement', get_entitlement(p_user));
end $$;

create or replace function update_profile(p_user uuid, p_patch jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  -- Only these fields are user-editable. role is never touched here.
  update profiles set
    display_name = left(coalesce(nullif(btrim(p_patch->>'display_name'), ''), display_name), 40),
    avatar = coalesce((p_patch->>'avatar')::int, avatar),
    daily_goal_xp = coalesce((p_patch->>'daily_goal_xp')::int, daily_goal_xp),
    accent = coalesce(p_patch->>'accent', accent)
  where id = p_user;
  return (select to_jsonb(p) from profiles p where p.id = p_user);
end $$;

-- ───────────────────────── Progress sync ─────────────────────────
-- The client is offline-first and sends an outbox of events plus its current
-- state. Events are idempotent (client_event_id) and XP is capped server-side.
create or replace function sync_learner(p_user uuid, p_events jsonb, p_snapshot jsonb, p_client_updated_at bigint)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  e jsonb; d jsonb; ts timestamptz; accepted int := 0; rejected int := 0; day_xp int; amt int;
begin
  perform get_account(p_user);
  if jsonb_typeof(coalesce(p_events, '[]'::jsonb)) <> 'array' or jsonb_array_length(coalesce(p_events, '[]'::jsonb)) > 1000 then
    raise exception 'invalid_events';
  end if;

  for e in select * from jsonb_array_elements(coalesce(p_events, '[]'::jsonb)) loop
    d := e->'data';
    ts := least(to_timestamp((e->>'at')::bigint / 1000.0), now());
    begin
      case e->>'kind'
        when 'attempt' then
          insert into exercise_attempts (user_id, client_event_id, question_id, topic_id, is_correct, misconception_tag, response_ms, context, difficulty, used_hint, answer_given, attempted_at)
          values (p_user, e->>'id', d->>'ex', d->>'topic', (d->>'ok')::boolean, d->>'tag', least(greatest((d->>'ms')::int, 0), 3600000), d->>'ctx', (d->>'d')::int, coalesce((d->>'hint')::boolean, false), left(d->>'given', 200), ts)
          on conflict (user_id, client_event_id) do nothing;
        when 'xp' then
          amt := (d->>'amount')::int;
          select coalesce(sum(amount), 0) into day_xp from xp_transactions where user_id = p_user and occurred_at::date = ts::date;
          if amt between 1 and 200 and day_xp + amt <= 3000 then
            insert into xp_transactions (user_id, client_event_id, amount, reason, ref_id, occurred_at)
            values (p_user, e->>'id', amt, d->>'reason', d->>'ref', ts)
            on conflict (user_id, client_event_id) do nothing;
          else
            rejected := rejected + 1;
          end if;
        when 'review' then
          insert into review_history (user_id, client_event_id, item_key, is_correct, interval_before, interval_after, reviewed_at)
          values (p_user, e->>'id', d->>'key', (d->>'ok')::boolean, (d->>'before')::int, (d->>'after')::int, ts)
          on conflict (user_id, client_event_id) do nothing;
        when 'lesson', 'exam', 'homework' then
          insert into learning_history (user_id, client_event_id, event_type, ref_id, score, passed, is_late, occurred_at)
          values (p_user, e->>'id', e->>'kind', d->>'id', (d->>'score')::int, (d->>'passed')::boolean, (d->>'late')::boolean, ts)
          on conflict (user_id, client_event_id) do nothing;
        when 'achievement' then
          insert into user_achievements (user_id, achievement_id, earned_at)
          select p_user, a.id, ts from achievements a where a.id = d->>'id'
          on conflict (user_id, achievement_id) do nothing;
        else
          rejected := rejected + 1;
      end case;
      accepted := accepted + 1;
    exception when others then
      -- A malformed event must not block the rest of the batch.
      rejected := rejected + 1;
    end;
  end loop;

  if p_snapshot is not null then
    insert into learner_snapshots (user_id, state, client_updated_at)
    values (p_user, p_snapshot, p_client_updated_at)
    on conflict (user_id) do update set state = excluded.state, client_updated_at = excluded.client_updated_at, updated_at = now()
    where learner_snapshots.client_updated_at <= excluded.client_updated_at;

    insert into mastery_records (user_id, topic_id, score, stage, attempts, correct, provisional_at, retest_due_at, mastered_at, last_attempt_at)
    select p_user, t.key, least(greatest((t.value->>'score')::int, 0), 100), t.value->>'stage', (t.value->>'attempts')::int, (t.value->>'correct')::int,
           to_timestamp((t.value->>'provisionalAt')::bigint / 1000.0), to_timestamp((t.value->>'retestDueAt')::bigint / 1000.0),
           to_timestamp((t.value->>'masteredAt')::bigint / 1000.0), to_timestamp((t.value->>'lastAt')::bigint / 1000.0)
    from jsonb_each(coalesce(p_snapshot->'topics', '{}'::jsonb)) t
    where t.value->>'stage' in ('new','learning','practicing','provisional','mastered','needs-review')
    on conflict (user_id, topic_id) do update set score = excluded.score, stage = excluded.stage, attempts = excluded.attempts, correct = excluded.correct,
      provisional_at = excluded.provisional_at, retest_due_at = excluded.retest_due_at, mastered_at = excluded.mastered_at, last_attempt_at = excluded.last_attempt_at;

    insert into review_schedules (user_id, item_key, step, interval_days, due_at, lapses)
    select p_user, r.key, (r.value->>'step')::int, greatest((r.value->>'intervalDays')::int, 1), to_timestamp((r.value->>'dueAt')::bigint / 1000.0), (r.value->>'lapses')::int
    from jsonb_each(coalesce(p_snapshot->'reviews', '{}'::jsonb)) r
    on conflict (user_id, item_key) do update set step = excluded.step, interval_days = excluded.interval_days, due_at = excluded.due_at, lapses = excluded.lapses;

    insert into lesson_progress (user_id, lesson_id, step, mastery_best, mastery_attempts, completed_at)
    select p_user, l.key, (l.value->>'step')::int, least(greatest((l.value->>'masteryBest')::int, 0), 100), (l.value->>'masteryAttempts')::int, to_timestamp((l.value->>'completedAt')::bigint / 1000.0)
    from jsonb_each(coalesce(p_snapshot->'lessons', '{}'::jsonb)) l
    on conflict (user_id, lesson_id) do update set step = excluded.step, mastery_best = excluded.mastery_best, mastery_attempts = excluded.mastery_attempts, completed_at = excluded.completed_at;

    update streaks set
      current_streak = greatest((p_snapshot->'streak'->>'current')::int, 0),
      longest_streak = greatest((p_snapshot->'streak'->>'longest')::int, 0),
      last_active_date = nullif(p_snapshot->'streak'->>'lastDate', '')::date,
      freezes = least(greatest((p_snapshot->'streak'->>'freezes')::int, 0), 3)
    where user_id = p_user and p_snapshot ? 'streak';

    update profiles set
      display_name = left(coalesce(nullif(btrim(p_snapshot->'profile'->>'name'), ''), display_name), 40),
      placement_level = coalesce((select code from cefr_levels where code = p_snapshot->'profile'->>'placementLevel'), placement_level)
    where id = p_user;
  end if;

  return jsonb_build_object('accepted', accepted, 'rejected', rejected, 'entitlement', (get_account(p_user))->'entitlement');
end $$;

create or replace function get_snapshot(p_user uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce((select jsonb_build_object('state', state, 'client_updated_at', client_updated_at) from learner_snapshots where user_id = p_user), 'null'::jsonb);
$$;

-- Weekly leaderboard from the XP ledger (week starts Monday, Jakarta time).
create or replace function get_leaderboard(p_user uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  with bounds as (select (date_trunc('week', now() at time zone 'Asia/Jakarta')) at time zone 'Asia/Jakarta' as week_start),
  totals as (
    select x.user_id, sum(x.amount)::int as xp
    from xp_transactions x, bounds b where x.occurred_at >= b.week_start group by x.user_id),
  ranked as (
    select t.user_id, t.xp, p.display_name, p.avatar, rank() over (order by t.xp desc, t.user_id) as rank
    from totals t join profiles p on p.id = t.user_id)
  select jsonb_build_object(
    'week_start', (select week_start from bounds),
    'top', coalesce((select jsonb_agg(jsonb_build_object('rank', rank, 'name', display_name, 'avatar', avatar, 'xp', xp, 'me', user_id = p_user) order by rank) from ranked where rank <= 30), '[]'::jsonb),
    'me', (select jsonb_build_object('rank', rank, 'xp', xp) from ranked where user_id = p_user));
$$;

-- ───────────────────────── CMS ─────────────────────────
-- Generic upsert. An existing row is patched with only the columns present in
-- the JSON (partial edits from the CMS); a new row is inserted with those
-- columns, so defaults and constraints keep validating every write.
create or replace function app_upsert(p_table text, p_row jsonb, p_key text default 'id') returns void
language plpgsql security definer set search_path = public as $$
declare cols text; patch text; present boolean;
begin
  select string_agg(format('%I', c.column_name), ', '),
         string_agg(format('%I', c.column_name), ', ') filter (where c.column_name <> p_key)
    into cols, patch
  from information_schema.columns c
  where c.table_schema = 'public' and c.table_name = p_table and p_row ? c.column_name and c.is_generated = 'NEVER' and c.identity_generation is null;
  if cols is null or not (p_row ? p_key) then raise exception 'invalid_row for %', p_table using errcode = '22023'; end if;
  execute format('select exists (select 1 from public.%I where %I = $1)', p_table, p_key) into present using p_row->>p_key;
  if present then
    if patch is not null then
      execute format('update public.%I t set (%s) = (select %s from jsonb_populate_record(null::public.%I, $1)) where t.%I = $2',
                     p_table, patch, patch, p_table, p_key) using p_row, p_row->>p_key;
    end if;
  else
    execute format('insert into public.%I (%s) select %s from jsonb_populate_record(null::public.%I, $1)', p_table, cols, cols, p_table) using p_row;
  end if;
end $$;

create or replace function cms_table(p_table text) returns text
language plpgsql immutable as $$
begin
  if p_table not in ('cefr_levels','courses','chapters','units','grammar_topics','misconception_tags','lessons','questions','vocabulary',
                     'conversation_scenarios','listening_items','pronunciation_guides','homework','exams','audio_resources','achievements') then
    raise exception 'unknown_table %', p_table using errcode = '22023';
  end if;
  return p_table;
end $$;

-- Saves a question with its answer options in one transaction.
create or replace function save_question(p_q jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare o jsonb; i int := 0;
begin
  perform app_upsert('questions', p_q - 'options');
  if not (p_q ? 'options') then return; end if;
  delete from answer_options where question_id = p_q->>'id';
  for o in select * from jsonb_array_elements(coalesce(p_q->'options', '[]'::jsonb)) loop
    insert into answer_options (question_id, position, body, is_correct, feedback, misconception_tag)
    values (p_q->>'id', i, o->>'text', coalesce((o->>'correct')::boolean, false), o->>'why', o->>'tag');
    i := i + 1;
  end loop;
end $$;

create or replace function save_lesson(p_l jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform app_upsert('lessons', (p_l - 'objectives') || jsonb_build_object('updated_at', now()));
  if p_l ? 'objectives' then
    delete from learning_objectives where lesson_id = p_l->>'id';
    insert into learning_objectives (lesson_id, position, body)
    select p_l->>'id', (o.ord - 1)::int, o.value #>> '{}' from jsonb_array_elements(p_l->'objectives') with ordinality o(value, ord)
    where char_length(btrim(o.value #>> '{}')) > 0;
  end if;
end $$;

create or replace function save_linked(p_table text, p_row jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform app_upsert(p_table, p_row - 'question_ids');
  if p_table = 'homework' and p_row ? 'question_ids' then
    delete from homework_questions where homework_id = p_row->>'id';
    insert into homework_questions (homework_id, question_id, position)
    select p_row->>'id', q.value #>> '{}', (q.ord - 1)::int from jsonb_array_elements(p_row->'question_ids') with ordinality q(value, ord);
  elsif p_table = 'exams' and p_row ? 'question_ids' then
    delete from exam_questions where exam_id = p_row->>'id';
    insert into exam_questions (exam_id, question_id, position)
    select p_row->>'id', q.value #>> '{}', (q.ord - 1)::int from jsonb_array_elements(p_row->'question_ids') with ordinality q(value, ord);
  end if;
end $$;

create or replace function admin_upsert(p_actor uuid, p_table text, p_row jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform assert_admin(p_actor);
  perform cms_table(p_table);
  if p_table = 'questions' then perform save_question(p_row);
  elsif p_table = 'lessons' then perform save_lesson(p_row);
  elsif p_table in ('homework', 'exams') then perform save_linked(p_table, p_row);
  else perform app_upsert(p_table, p_row, case when p_table = 'cefr_levels' then 'code' when p_table = 'audio_resources' then 'key' else 'id' end);
  end if;
  return jsonb_build_object('ok', true);
end $$;

create or replace function admin_delete(p_actor uuid, p_table text, p_id text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  perform assert_admin(p_actor);
  perform cms_table(p_table);
  execute format('delete from public.%I where %I = $1', p_table, case when p_table = 'cefr_levels' then 'code' when p_table = 'audio_resources' then 'key' else 'id' end) using p_id;
  get diagnostics n = row_count;
  return jsonb_build_object('deleted', n);
end $$;

-- Full editable curriculum (drafts included when p_all), as flat rows.
create or replace function content_rows(p_all boolean) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'cefr_levels', (select coalesce(jsonb_agg(to_jsonb(t) order by t.position), '[]') from cefr_levels t),
    'courses', (select coalesce(jsonb_agg(to_jsonb(t) order by t.id), '[]') from courses t),
    'chapters', (select coalesce(jsonb_agg(to_jsonb(t) order by t.course_id, t.position), '[]') from chapters t),
    'units', (select coalesce(jsonb_agg(to_jsonb(t) order by t.chapter_id, t.position), '[]') from units t),
    'grammar_topics', (select coalesce(jsonb_agg(to_jsonb(t) order by t.id), '[]') from grammar_topics t),
    'misconception_tags', (select coalesce(jsonb_agg(to_jsonb(t) order by t.id), '[]') from misconception_tags t),
    'lessons', (select coalesce(jsonb_agg(to_jsonb(l) || jsonb_build_object('objectives',
        (select coalesce(jsonb_agg(o.body order by o.position), '[]') from learning_objectives o where o.lesson_id = l.id)) order by l.unit_id, l.position), '[]')
      from lessons l where p_all or l.status = 'published'),
    'questions', (select coalesce(jsonb_agg(jsonb_strip_nulls(to_jsonb(q)) || jsonb_build_object('options',
        (select coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object('text', a.body, 'correct', nullif(a.is_correct, false), 'why', a.feedback, 'tag', a.misconception_tag)) order by a.position), '[]')
           from answer_options a where a.question_id = q.id)) order by q.id), '[]')
      from questions q
      where p_all or (q.status = 'published' and (q.lesson_id is null or exists (select 1 from lessons l where l.id = q.lesson_id and l.status = 'published')))),
    'vocabulary', (select coalesce(jsonb_agg(to_jsonb(t) order by t.level_code, t.set_name, t.id), '[]') from vocabulary t),
    'conversation_scenarios', (select coalesce(jsonb_agg(to_jsonb(t) order by t.level_code, t.id), '[]') from conversation_scenarios t),
    'listening_items', (select coalesce(jsonb_agg(to_jsonb(t) order by t.level_code, t.id), '[]') from listening_items t),
    'pronunciation_guides', (select coalesce(jsonb_agg(to_jsonb(t) order by t.id), '[]') from pronunciation_guides t),
    'homework', (select coalesce(jsonb_agg(to_jsonb(h) || jsonb_build_object('question_ids',
        (select coalesce(jsonb_agg(hq.question_id order by hq.position), '[]') from homework_questions hq where hq.homework_id = h.id)) order by h.id), '[]') from homework h),
    'exams', (select coalesce(jsonb_agg(to_jsonb(x) || jsonb_build_object('question_ids',
        (select coalesce(jsonb_agg(xq.question_id order by xq.position), '[]') from exam_questions xq where xq.exam_id = x.id)) order by x.id), '[]') from exams x),
    'audio_resources', (select coalesce(jsonb_agg(to_jsonb(t) order by t.key), '[]') from audio_resources t),
    'achievements', (select coalesce(jsonb_agg(to_jsonb(t) order by t.id), '[]') from achievements t));
$$;

create or replace function admin_content(p_actor uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform assert_admin(p_actor);
  return content_rows(true);
end $$;

-- Bulk import of a content pack (rows in the same shape content_rows returns).
create or replace function import_content(p_actor uuid, p_rows jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r jsonb; t text; n int := 0;
begin
  if p_actor is not null then perform assert_admin(p_actor); end if;
  foreach t in array array['cefr_levels','courses','chapters','units','grammar_topics','misconception_tags','audio_resources','listening_items',
                           'vocabulary','conversation_scenarios','pronunciation_guides','achievements'] loop
    for r in select * from jsonb_array_elements(coalesce(p_rows->t, '[]'::jsonb)) loop
      perform app_upsert(t, r, case when t = 'cefr_levels' then 'code' when t = 'audio_resources' then 'key' else 'id' end);
      n := n + 1;
    end loop;
  end loop;
  for r in select * from jsonb_array_elements(coalesce(p_rows->'lessons', '[]'::jsonb)) loop perform save_lesson(r); n := n + 1; end loop;
  for r in select * from jsonb_array_elements(coalesce(p_rows->'questions', '[]'::jsonb)) loop perform save_question(r); n := n + 1; end loop;
  for r in select * from jsonb_array_elements(coalesce(p_rows->'homework', '[]'::jsonb)) loop perform save_linked('homework', r); n := n + 1; end loop;
  for r in select * from jsonb_array_elements(coalesce(p_rows->'exams', '[]'::jsonb)) loop perform save_linked('exams', r); n := n + 1; end loop;
  return jsonb_build_object('rows', n);
end $$;

-- Quality gate + publish. Students only ever see the current published snapshot.
create or replace function publish_curriculum(p_actor uuid, p_label text, p_notes text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare problems text[]; v_id bigint;
begin
  if p_actor is not null then perform assert_admin(p_actor); end if;

  select array_agg(msg) into problems from (
    select format('%s: pilihan ganda harus punya tepat satu jawaban benar', q.id) as msg
      from questions q
     where q.status = 'published' and q.type in ('mc','vocab','dialogue','read','listen','tf')
       and (select count(*) from answer_options a where a.question_id = q.id and a.is_correct) <> 1
    union all
    select format('%s: belum ada kunci jawaban', q.id)
      from questions q
     where q.status = 'published' and q.type in ('fill','arrange','construct','translate','fix')
       and coalesce(jsonb_array_length(q.payload->'answers'), 0) = 0
    union all
    select format('%s: pelajaran terbit tanpa penjelasan materi', l.id)
      from lessons l where l.status = 'published' and (jsonb_array_length(l.teaching) = 0 or char_length(btrim(l.intro)) = 0)
    union all
    select format('%s: pelajaran terbit tanpa soal tes penguasaan', l.id)
      from lessons l where l.status = 'published'
       and not exists (select 1 from questions q where q.lesson_id = l.id and q.stage = 'mastery' and q.status = 'published')
    limit 50) p;
  if problems is not null then
    return jsonb_build_object('published', false, 'problems', to_jsonb(problems));
  end if;

  update curriculum_versions set is_current = false where is_current;
  insert into curriculum_versions (label, notes, is_current, snapshot, published_by)
  values (coalesce(nullif(btrim(p_label), ''), to_char(now(), 'YYYY.MM.DD-HH24MI')), coalesce(p_notes, ''), true, content_rows(false), p_actor)
  returning id into v_id;
  return jsonb_build_object('published', true, 'version', v_id);
end $$;

create or replace function get_published_content() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce((select jsonb_build_object('version', id, 'label', label, 'published_at', published_at, 'rows', snapshot)
                     from curriculum_versions where is_current), 'null'::jsonb);
$$;

create or replace function get_content_version() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce((select jsonb_build_object('version', id, 'label', label) from curriculum_versions where is_current), 'null'::jsonb);
$$;

create or replace function list_curriculum_versions(p_actor uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform assert_admin(p_actor);
  return (select coalesce(jsonb_agg(jsonb_build_object('id', v.id, 'label', v.label, 'notes', v.notes, 'is_current', v.is_current, 'published_at', v.published_at,
            'lessons', jsonb_array_length(v.snapshot->'lessons'), 'questions', jsonb_array_length(v.snapshot->'questions')) order by v.id desc), '[]'::jsonb)
          from curriculum_versions v);
end $$;

-- Rollback: make an older snapshot the one students receive.
create or replace function restore_curriculum_version(p_actor uuid, p_id bigint) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform assert_admin(p_actor);
  if not exists (select 1 from curriculum_versions where id = p_id) then raise exception 'not_found'; end if;
  update curriculum_versions set is_current = false where is_current;
  update curriculum_versions set is_current = true where id = p_id;
  return jsonb_build_object('version', p_id);
end $$;

-- ═════════════════════════ 0004_payments ═════════════════════════
-- Payments and subscriptions (Xendit: QRIS, DANA, GoPay).
-- Rules enforced here, inside the database transaction:
--   * the price comes from subscription_plans, never from the client;
--   * premium is granted only by process_payment_event, which is called only
--     from the verified webhook handler or from an official status lookup;
--   * amount, currency, channel and gateway ids must match the transaction;
--   * every event is recorded once (event_key) and a payment can create at
--     most one subscription period (subscriptions.source_transaction_id).

create or replace function create_payment_intent(p_user uuid, p_plan text, p_channel text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare plan subscription_plans; tx payment_transactions;
begin
  perform get_account(p_user);
  select * into plan from subscription_plans where id = p_plan and is_active and price_idr > 0;
  if not found then raise exception 'invalid_plan' using errcode = '22023'; end if;
  if p_channel is null or p_channel not in ('QRIS','DANA','GOPAY') then raise exception 'invalid_channel' using errcode = '22023'; end if;

  -- Reuse an open checkout instead of creating duplicates on double taps.
  select * into tx from payment_transactions
   where user_id = p_user and plan_id = p_plan and channel = p_channel and status = 'PENDING'
     and gateway_payment_request_id is not null and expires_at > now() + interval '2 minutes'
   order by created_at desc limit 1;
  if found then return jsonb_build_object('transaction', to_jsonb(tx), 'reused', true); end if;

  if (select count(*) from payment_transactions where user_id = p_user and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'too_many_requests' using errcode = '53400';
  end if;

  insert into payment_transactions (user_id, plan_id, reference_id, amount_idr, channel)
  values (p_user, p_plan, 'LTR-' || replace(gen_random_uuid()::text, '-', ''), plan.price_idr, p_channel)
  returning * into tx;
  return jsonb_build_object('transaction', to_jsonb(tx), 'reused', false, 'plan', to_jsonb(plan));
end $$;

create or replace function attach_gateway_payment(p_tx uuid, p_request_id text, p_checkout jsonb, p_expires_at timestamptz) returns jsonb
language plpgsql security definer set search_path = public as $$
declare tx payment_transactions;
begin
  update payment_transactions
     set gateway_payment_request_id = p_request_id, checkout = p_checkout, expires_at = p_expires_at, updated_at = now()
   where id = p_tx and status = 'PENDING' and gateway_payment_request_id is null
  returning * into tx;
  if not found then raise exception 'transaction_not_open'; end if;
  return to_jsonb(tx);
end $$;

-- The gateway refused to create the payment request.
create or replace function fail_payment_intent(p_tx uuid, p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  update payment_transactions set status = 'FAILED', failure_code = left(p_code, 80), updated_at = now()
   where id = p_tx and status = 'PENDING' and gateway_payment_request_id is null;
  return jsonb_build_object('ok', true);
end $$;

create or replace function process_payment_event(
  p_event_key text, p_source text, p_event_type text, p_reference_id text, p_payment_request_id text, p_payment_id text,
  p_status text, p_amount numeric, p_currency text, p_channel text, p_failure_code text, p_payload jsonb
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  ev_id bigint; tx payment_transactions; plan subscription_plans; v_outcome text; v_detail text; base timestamptz;
begin
  if coalesce(btrim(p_event_key), '') = '' then raise exception 'event_key_required'; end if;

  -- Layer 1: the same event is processed once.
  insert into payment_webhook_events (event_key, source, event_type, reference_id, payload)
  values (p_event_key, p_source, p_event_type, p_reference_id, coalesce(p_payload, '{}'::jsonb))
  on conflict (event_key) do nothing returning id into ev_id;
  if ev_id is null then
    update payment_webhook_events set duplicate_count = duplicate_count + 1 where event_key = p_event_key;
    return jsonb_build_object('outcome', 'duplicate');
  end if;

  select * into tx from payment_transactions where reference_id = p_reference_id for update;
  if not found then
    v_outcome := 'unknown_reference';
  elsif p_payment_request_id is not null and tx.gateway_payment_request_id is distinct from p_payment_request_id then
    v_outcome := 'request_mismatch';
    v_detail := 'gateway payment request id does not match the transaction';
  elsif p_status = 'SUCCEEDED' then
    if tx.status = 'SUCCEEDED' then
      -- Layer 2: a different event for a payment that is already settled.
      v_outcome := 'already_processed';
    elsif p_currency is distinct from 'IDR' or p_amount is null or p_amount <> tx.amount_idr then
      v_outcome := 'amount_mismatch';
      v_detail := format('expected IDR %s, got %s %s', tx.amount_idr, coalesce(p_currency, '?'), coalesce(p_amount::text, '?'));
      update payment_transactions set status = 'NEEDS_REVIEW', failure_code = 'AMOUNT_MISMATCH', gateway_payment_id = coalesce(p_payment_id, gateway_payment_id), updated_at = now() where id = tx.id;
    elsif p_channel is not null and p_channel <> tx.channel then
      v_outcome := 'channel_mismatch';
      v_detail := format('expected %s, got %s', tx.channel, p_channel);
      update payment_transactions set status = 'NEEDS_REVIEW', failure_code = 'CHANNEL_MISMATCH', gateway_payment_id = coalesce(p_payment_id, gateway_payment_id), updated_at = now() where id = tx.id;
    elsif tx.status in ('NEEDS_REVIEW', 'CANCELED') then
      v_outcome := 'needs_review';
      v_detail := format('payment captured for a %s transaction', tx.status);
      update payment_transactions set status = 'NEEDS_REVIEW', gateway_payment_id = coalesce(p_payment_id, gateway_payment_id), updated_at = now() where id = tx.id;
    else
      -- PENDING, or EXPIRED/FAILED locally while the customer still paid.
      select * into plan from subscription_plans where id = tx.plan_id;
      -- A renewal starts when the current period ends, so no paid day is lost.
      select greatest(now(), coalesce(max(expires_at), now())) into base from subscriptions where user_id = tx.user_id and expires_at > now();
      insert into subscriptions (user_id, plan_id, starts_at, expires_at, source_transaction_id)
      values (tx.user_id, tx.plan_id, base, base + make_interval(days => plan.duration_days), tx.id)
      on conflict (source_transaction_id) do nothing;
      update payment_transactions set status = 'SUCCEEDED', paid_at = now(), failure_code = null, gateway_payment_id = coalesce(p_payment_id, gateway_payment_id), updated_at = now() where id = tx.id;
      v_outcome := 'activated';
    end if;
  elsif p_status in ('FAILED', 'EXPIRED', 'CANCELED') then
    if tx.status = 'PENDING' then
      update payment_transactions set status = p_status, failure_code = left(coalesce(p_failure_code, p_status), 80), gateway_payment_id = coalesce(p_payment_id, gateway_payment_id), updated_at = now() where id = tx.id;
      v_outcome := lower(p_status);
    else
      v_outcome := 'ignored';
      v_detail := format('transaction already %s', tx.status);
    end if;
  else
    v_outcome := 'ignored';
    v_detail := format('status %s needs no action', coalesce(p_status, '?'));
  end if;

  update payment_webhook_events set outcome = v_outcome, detail = v_detail, transaction_id = tx.id where id = ev_id;
  if tx.id is null then return jsonb_build_object('outcome', v_outcome); end if;
  return jsonb_build_object('outcome', v_outcome, 'detail', v_detail,
    'transaction', (select to_jsonb(t) from payment_transactions t where t.id = tx.id),
    'entitlement', get_entitlement(tx.user_id));
end $$;

create or replace function get_payment(p_user uuid, p_tx uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce((select to_jsonb(t) || jsonb_build_object('plan_name', p.name, 'duration_days', p.duration_days)
                     from payment_transactions t join subscription_plans p on p.id = t.plan_id
                    where t.id = p_tx and t.user_id = p_user), 'null'::jsonb);
$$;

create or replace function list_payments(p_user uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'transactions', coalesce((select jsonb_agg(x order by x->>'created_at' desc) from (
        select jsonb_build_object('id', t.id, 'reference_id', t.reference_id, 'plan_id', t.plan_id, 'plan_name', p.name, 'amount_idr', t.amount_idr,
                                  'channel', t.channel, 'status', t.status, 'created_at', t.created_at, 'paid_at', t.paid_at, 'failure_code', t.failure_code) as x
          from payment_transactions t join subscription_plans p on p.id = t.plan_id
         where t.user_id = p_user order by t.created_at desc limit 50) s), '[]'::jsonb),
    'periods', coalesce((select jsonb_agg(jsonb_build_object('plan_id', s.plan_id, 'starts_at', s.starts_at, 'expires_at', s.expires_at, 'transaction_id', s.source_transaction_id) order by s.starts_at desc)
                           from subscriptions s where s.user_id = p_user), '[]'::jsonb),
    'entitlement', get_entitlement(p_user));
$$;

create or replace function admin_payment_overview(p_actor uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare month_start timestamptz; year_start timestamptz;
begin
  perform assert_admin(p_actor);
  month_start := date_trunc('month', now() at time zone 'Asia/Jakarta') at time zone 'Asia/Jakarta';
  year_start := date_trunc('year', now() at time zone 'Asia/Jakarta') at time zone 'Asia/Jakarta';
  return jsonb_build_object(
    'users', (select jsonb_build_object('total', count(*), 'premium', count(*) filter (where exists (select 1 from subscriptions s where s.user_id = p.id and s.expires_at > now())),
                                        'free', count(*) filter (where not exists (select 1 from subscriptions s where s.user_id = p.id and s.expires_at > now()))) from profiles p),
    'transactions', (select jsonb_build_object(
        'succeeded', count(*) filter (where status = 'SUCCEEDED'), 'pending', count(*) filter (where status = 'PENDING'),
        'failed', count(*) filter (where status in ('FAILED','EXPIRED','CANCELED')), 'needs_review', count(*) filter (where status = 'NEEDS_REVIEW')) from payment_transactions),
    'revenue', jsonb_build_object(
        'month', (select coalesce(sum(amount_idr), 0) from payment_transactions where status = 'SUCCEEDED' and paid_at >= month_start),
        'year', (select coalesce(sum(amount_idr), 0) from payment_transactions where status = 'SUCCEEDED' and paid_at >= year_start),
        'by_month', (select coalesce(jsonb_agg(jsonb_build_object('month', m, 'total', total, 'count', n) order by m), '[]'::jsonb) from (
            select to_char(paid_at at time zone 'Asia/Jakarta', 'YYYY-MM') as m, sum(amount_idr) as total, count(*) as n
              from payment_transactions where status = 'SUCCEEDED' and paid_at >= now() - interval '12 months' group by 1) q)),
    'history', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('id', t.id, 'reference_id', t.reference_id, 'user', p.display_name, 'user_id', t.user_id, 'plan_id', t.plan_id, 'amount_idr', t.amount_idr,
                                  'channel', t.channel, 'status', t.status, 'failure_code', t.failure_code, 'created_at', t.created_at, 'paid_at', t.paid_at) as x
          from payment_transactions t join profiles p on p.id = t.user_id order by t.created_at desc limit 200) s),
    'subscribers', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('user_id', s.user_id, 'user', p.display_name, 'plan_id', min(s.plan_id), 'starts_at', min(s.starts_at), 'expires_at', max(s.expires_at)) as x
          from subscriptions s join profiles p on p.id = s.user_id where s.expires_at > now() group by s.user_id, p.display_name order by max(s.expires_at) limit 500) s),
    'webhooks', jsonb_build_object(
        'last_received_at', (select max(received_at) from payment_webhook_events where source = 'webhook'),
        'last_24h', (select coalesce(jsonb_object_agg(outcome, n), '{}'::jsonb) from (select outcome, count(*) as n from payment_webhook_events where received_at > now() - interval '24 hours' group by outcome) q),
        'log', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
            select jsonb_build_object('id', e.id, 'event_key', e.event_key, 'source', e.source, 'event_type', e.event_type, 'reference_id', e.reference_id,
                                      'outcome', e.outcome, 'detail', e.detail, 'duplicates', e.duplicate_count, 'received_at', e.received_at) as x
              from payment_webhook_events e order by e.received_at desc limit 200) s)));
end $$;

-- Lock every function down to the service role (see 0002_security.sql).
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.prokind = 'f' loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;

-- ═════════════════════════ 0005_manual_qris ═════════════════════════
-- Manual QRIS payments (owner decision, November 2026).
-- The learner pays the owner's own QRIS: one QR per plan with the plan price
-- embedded. No gateway reports the payment, so Premium is granted only when an
-- admin confirms it (admin_confirm_payment). The Xendit flow from 0004 stays in
-- the schema but is switched off in the app unless PAYMENT_PROVIDER=xendit.
--
-- Rules kept from 0004: the amount comes from subscription_plans, never from
-- the client; one payment creates at most one subscription period; a renewal
-- starts when the current period ends; the learner can never grant Premium.

-- ───────────── Plans: discount display and the QR for each plan ─────────────
alter table subscription_plans
  add column list_price_idr int check (list_price_idr is null or list_price_idr > 0),
  add column qris_payload text;

-- Yearly: Rp585.000 shown struck through, 15% off, Rp497.250 charged.
update subscription_plans set price_idr = 497250, list_price_idr = 585000 where id = 'premium_yearly';

-- Dynamic QRIS (DANA, merchant "Lentera english, Service", NMID ID1026639132426).
-- The amount is embedded (tag 54) and matches price_idr; the app re-checks it.
update subscription_plans set qris_payload =
  '00020101021226570011ID.DANA.WWW011893600915003698143502090369814350303UMI51440014ID.CO.QRIS.WWW0215ID10266391324260303UMI5204899953033605405585005802ID5924Lentera english, Service6006Lingga610529871621960150011ID.DANA.WWW6304236A'
  where id = 'premium_monthly';
update subscription_plans set qris_payload =
  '00020101021226570011ID.DANA.WWW011893600915003698143502090369814350303UMI51440014ID.CO.QRIS.WWW0215ID10266391324260303UMI52048999530336054064972505802ID5924Lentera english, Service6006Lingga610529871621960150011ID.DANA.WWW630433A7'
  where id = 'premium_yearly';

-- ───────────── Transactions: the manual confirmation trail ─────────────
alter table payment_transactions drop constraint payment_transactions_status_check;
alter table payment_transactions add constraint payment_transactions_status_check
  check (status in ('PENDING','AWAITING_CONFIRMATION','SUCCEEDED','FAILED','EXPIRED','CANCELED','NEEDS_REVIEW'));
alter table payment_transactions
  add column method text not null default 'xendit' check (method in ('xendit','manual_qris')),
  -- What the learner reports after paying, so the admin can match the payment
  -- in the merchant app. Only a name and a short note: no account numbers.
  add column payer_name text check (payer_name is null or char_length(payer_name) between 1 and 80),
  add column payer_note text check (payer_note is null or char_length(payer_note) <= 300),
  add column claimed_at timestamptz,
  add column reviewed_by uuid references profiles(id) on delete set null,
  add column reviewed_at timestamptz,
  add column review_note text check (review_note is null or char_length(review_note) <= 300);
create index payment_transactions_queue_idx on payment_transactions(method, status, claimed_at);

-- Admin decisions are written to the same audit log as gateway events.
alter table payment_webhook_events drop constraint payment_webhook_events_source_check;
alter table payment_webhook_events add constraint payment_webhook_events_source_check
  check (source in ('webhook','reconcile','admin'));

-- A checkout nobody reported as paid closes after 24 hours so the admin queue
-- stays short. It can still be confirmed later if the money did arrive.
create or replace function expire_manual_payments() returns void
language plpgsql security definer set search_path = public as $$
begin
  update payment_transactions set status = 'EXPIRED', failure_code = 'NOT_REPORTED', updated_at = now()
   where method = 'manual_qris' and status = 'PENDING' and expires_at <= now();
end $$;

create or replace function create_manual_payment(p_user uuid, p_plan text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare plan subscription_plans; tx payment_transactions;
begin
  perform get_account(p_user);
  perform expire_manual_payments();
  select * into plan from subscription_plans where id = p_plan and is_active and price_idr > 0;
  if not found then raise exception 'invalid_plan' using errcode = '22023'; end if;
  if coalesce(btrim(plan.qris_payload), '') = '' then raise exception 'qris_not_configured' using errcode = '22023'; end if;

  -- One open checkout per plan: a second tap, or coming back later, reopens it.
  select * into tx from payment_transactions
   where user_id = p_user and plan_id = p_plan and method = 'manual_qris' and status in ('PENDING','AWAITING_CONFIRMATION')
   order by created_at desc limit 1;
  if found then return jsonb_build_object('transaction', to_jsonb(tx) - 'reviewed_by', 'reused', true); end if;

  if (select count(*) from payment_transactions where user_id = p_user and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'too_many_requests' using errcode = '53400';
  end if;

  insert into payment_transactions (user_id, plan_id, reference_id, amount_idr, channel, method, checkout, expires_at)
  values (p_user, p_plan, 'LTR-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)), plan.price_idr, 'QRIS', 'manual_qris',
          -- The QR is copied into the transaction, so replacing a plan's QR later never changes what this learner was shown.
          jsonb_build_object('kind', 'qr', 'value', plan.qris_payload), now() + interval '24 hours')
  returning * into tx;
  return jsonb_build_object('transaction', to_jsonb(tx) - 'reviewed_by', 'reused', false);
end $$;

-- The learner says "I have paid". This only queues the payment for review.
create or replace function claim_manual_payment(p_user uuid, p_tx uuid, p_payer_name text, p_note text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare tx payment_transactions; v_name text := btrim(coalesce(p_payer_name, ''));
begin
  if char_length(v_name) = 0 then raise exception 'payer_name_required' using errcode = '22023'; end if;
  perform expire_manual_payments();
  select * into tx from payment_transactions where id = p_tx and user_id = p_user for update;
  if not found then raise exception 'payment_not_found' using errcode = '22023'; end if;
  if tx.method <> 'manual_qris' or tx.status not in ('PENDING','EXPIRED','AWAITING_CONFIRMATION') then
    raise exception 'payment_not_open' using errcode = '22023';
  end if;
  update payment_transactions
     set status = 'AWAITING_CONFIRMATION', payer_name = left(v_name, 80),
         payer_note = nullif(left(btrim(coalesce(p_note, '')), 300), ''),
         claimed_at = coalesce(claimed_at, now()), failure_code = null, updated_at = now()
   where id = tx.id
  returning * into tx;
  return to_jsonb(tx) - 'reviewed_by';
end $$;

-- The only way a manual payment grants Premium.
create or replace function admin_confirm_payment(p_actor uuid, p_tx uuid, p_note text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare tx payment_transactions; plan subscription_plans; base timestamptz;
begin
  perform assert_admin(p_actor);
  select * into tx from payment_transactions where id = p_tx for update;
  if not found then raise exception 'payment_not_found' using errcode = '22023'; end if;
  if tx.method <> 'manual_qris' then raise exception 'not_manual_payment' using errcode = '22023'; end if;
  -- Idempotent: a second click (or two admins at once) changes nothing.
  if tx.status = 'SUCCEEDED' then
    return jsonb_build_object('outcome', 'already_processed', 'transaction', to_jsonb(tx), 'entitlement', get_entitlement(tx.user_id));
  end if;
  -- A reported, unreported, late or previously rejected payment can be confirmed.
  if tx.status not in ('PENDING','AWAITING_CONFIRMATION','EXPIRED','FAILED') then
    raise exception 'payment_not_open' using errcode = '22023';
  end if;

  select * into plan from subscription_plans where id = tx.plan_id;
  select greatest(now(), coalesce(max(expires_at), now())) into base from subscriptions where user_id = tx.user_id and expires_at > now();
  insert into subscriptions (user_id, plan_id, starts_at, expires_at, source_transaction_id)
  values (tx.user_id, tx.plan_id, base, base + make_interval(days => plan.duration_days), tx.id)
  on conflict (source_transaction_id) do nothing;
  update payment_transactions
     set status = 'SUCCEEDED', paid_at = now(), failure_code = null, reviewed_by = p_actor, reviewed_at = now(),
         review_note = nullif(left(btrim(coalesce(p_note, '')), 300), ''), updated_at = now()
   where id = tx.id
  returning * into tx;
  insert into payment_webhook_events (event_key, source, event_type, reference_id, transaction_id, outcome, detail, payload)
  values ('admin:confirm:' || tx.id, 'admin', 'manual.confirm', tx.reference_id, tx.id, 'activated', tx.review_note,
          jsonb_build_object('admin', p_actor, 'amount_idr', tx.amount_idr, 'plan_id', tx.plan_id))
  on conflict (event_key) do update set duplicate_count = payment_webhook_events.duplicate_count + 1;
  return jsonb_build_object('outcome', 'activated', 'transaction', to_jsonb(tx), 'entitlement', get_entitlement(tx.user_id));
end $$;

create or replace function admin_reject_payment(p_actor uuid, p_tx uuid, p_reason text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare tx payment_transactions; v_reason text := btrim(coalesce(p_reason, ''));
begin
  perform assert_admin(p_actor);
  if char_length(v_reason) = 0 then raise exception 'reason_required' using errcode = '22023'; end if;
  select * into tx from payment_transactions where id = p_tx for update;
  if not found then raise exception 'payment_not_found' using errcode = '22023'; end if;
  if tx.method <> 'manual_qris' or tx.status not in ('PENDING','AWAITING_CONFIRMATION','EXPIRED') then
    raise exception 'payment_not_open' using errcode = '22023';
  end if;
  update payment_transactions
     set status = 'FAILED', failure_code = 'REJECTED', reviewed_by = p_actor, reviewed_at = now(),
         review_note = left(v_reason, 300), updated_at = now()
   where id = tx.id
  returning * into tx;
  insert into payment_webhook_events (event_key, source, event_type, reference_id, transaction_id, outcome, detail, payload)
  values ('admin:reject:' || tx.id || ':' || extract(epoch from now())::bigint, 'admin', 'manual.reject', tx.reference_id, tx.id, 'rejected', tx.review_note,
          jsonb_build_object('admin', p_actor))
  on conflict (event_key) do nothing;
  return jsonb_build_object('outcome', 'rejected', 'transaction', to_jsonb(tx));
end $$;

-- Learner view of one transaction: the reviewer's identity is not exposed.
create or replace function get_payment(p_user uuid, p_tx uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce((select (to_jsonb(t) - 'reviewed_by') || jsonb_build_object('plan_name', p.name, 'duration_days', p.duration_days)
                     from payment_transactions t join subscription_plans p on p.id = t.plan_id
                    where t.id = p_tx and t.user_id = p_user), 'null'::jsonb);
$$;

-- Plans as the learner sees them (price, struck-through price, availability).
create or replace function list_plans() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'name', name, 'price_idr', price_idr, 'list_price_idr', list_price_idr,
                                               'duration_days', duration_days, 'qris_ready', coalesce(btrim(qris_payload), '') <> '') order by price_idr), '[]'::jsonb)
  from subscription_plans where is_active and price_idr > 0;
$$;

-- Admin overview, extended with the confirmation queue.
create or replace function admin_payment_overview(p_actor uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare month_start timestamptz; year_start timestamptz;
begin
  perform assert_admin(p_actor);
  perform expire_manual_payments();
  month_start := date_trunc('month', now() at time zone 'Asia/Jakarta') at time zone 'Asia/Jakarta';
  year_start := date_trunc('year', now() at time zone 'Asia/Jakarta') at time zone 'Asia/Jakarta';
  return jsonb_build_object(
    'users', (select jsonb_build_object('total', count(*), 'premium', count(*) filter (where exists (select 1 from subscriptions s where s.user_id = p.id and s.expires_at > now())),
                                        'free', count(*) filter (where not exists (select 1 from subscriptions s where s.user_id = p.id and s.expires_at > now()))) from profiles p),
    'transactions', (select jsonb_build_object(
        'succeeded', count(*) filter (where status = 'SUCCEEDED'), 'pending', count(*) filter (where status = 'PENDING'),
        'awaiting', count(*) filter (where status = 'AWAITING_CONFIRMATION'),
        'failed', count(*) filter (where status in ('FAILED','EXPIRED','CANCELED')), 'needs_review', count(*) filter (where status = 'NEEDS_REVIEW')) from payment_transactions),
    'revenue', jsonb_build_object(
        'month', (select coalesce(sum(amount_idr), 0) from payment_transactions where status = 'SUCCEEDED' and paid_at >= month_start),
        'year', (select coalesce(sum(amount_idr), 0) from payment_transactions where status = 'SUCCEEDED' and paid_at >= year_start),
        'by_month', (select coalesce(jsonb_agg(jsonb_build_object('month', m, 'total', total, 'count', n) order by m), '[]'::jsonb) from (
            select to_char(paid_at at time zone 'Asia/Jakarta', 'YYYY-MM') as m, sum(amount_idr) as total, count(*) as n
              from payment_transactions where status = 'SUCCEEDED' and paid_at >= now() - interval '12 months' group by 1) q)),
    -- Reported payments first (oldest first), then checkouts not reported yet.
    'queue', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('id', t.id, 'reference_id', t.reference_id, 'user', p.display_name, 'user_id', t.user_id, 'plan_id', t.plan_id,
                                  'amount_idr', t.amount_idr, 'status', t.status, 'payer_name', t.payer_name, 'payer_note', t.payer_note,
                                  'claimed_at', t.claimed_at, 'created_at', t.created_at, 'expires_at', t.expires_at) as x
          from payment_transactions t join profiles p on p.id = t.user_id
         where t.method = 'manual_qris' and t.status in ('AWAITING_CONFIRMATION','PENDING')
         order by (t.status = 'AWAITING_CONFIRMATION') desc, coalesce(t.claimed_at, t.created_at) limit 200) s),
    'history', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('id', t.id, 'reference_id', t.reference_id, 'user', p.display_name, 'user_id', t.user_id, 'plan_id', t.plan_id, 'amount_idr', t.amount_idr,
                                  'channel', t.channel, 'method', t.method, 'status', t.status, 'failure_code', t.failure_code, 'created_at', t.created_at, 'paid_at', t.paid_at,
                                  'payer_name', t.payer_name, 'claimed_at', t.claimed_at, 'review_note', t.review_note, 'reviewed_at', t.reviewed_at,
                                  'reviewer', (select r.display_name from profiles r where r.id = t.reviewed_by)) as x
          from payment_transactions t join profiles p on p.id = t.user_id order by t.created_at desc limit 200) s),
    'subscribers', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('user_id', s.user_id, 'user', p.display_name, 'plan_id', min(s.plan_id), 'starts_at', min(s.starts_at), 'expires_at', max(s.expires_at)) as x
          from subscriptions s join profiles p on p.id = s.user_id where s.expires_at > now() group by s.user_id, p.display_name order by max(s.expires_at) limit 500) s),
    'webhooks', jsonb_build_object(
        'last_received_at', (select max(received_at) from payment_webhook_events where source = 'webhook'),
        'last_24h', (select coalesce(jsonb_object_agg(outcome, n), '{}'::jsonb) from (select outcome, count(*) as n from payment_webhook_events where received_at > now() - interval '24 hours' group by outcome) q),
        'log', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
            select jsonb_build_object('id', e.id, 'event_key', e.event_key, 'source', e.source, 'event_type', e.event_type, 'reference_id', e.reference_id,
                                      'outcome', e.outcome, 'detail', e.detail, 'duplicates', e.duplicate_count, 'received_at', e.received_at) as x
              from payment_webhook_events e order by e.received_at desc limit 200) s)));
end $$;

-- Lock every function down to the service role, as at the end of 0004.
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.prokind = 'f' loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;

-- Catat di riwayat migrasi Supabase agar sama dengan migrasi lewat CLI/konektor.
insert into supabase_migrations.schema_migrations (version, name)
values ('20261114070003', '0003_functions'), ('20261114070004', '0004_payments'), ('20261114070005', '0005_manual_qris')
on conflict do nothing;

commit;

select case when count(*) = 3 then 'OK: 3 migrasi terpasang' else 'PERIKSA: hanya ' || count(*) || ' dari 3 migrasi tercatat' end as hasil
from supabase_migrations.schema_migrations where name in ('0003_functions', '0004_payments', '0005_manual_qris');
