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
