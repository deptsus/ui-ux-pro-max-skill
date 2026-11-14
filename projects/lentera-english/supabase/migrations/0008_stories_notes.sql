-- 0008 (Rilis 1): illustrated story exercises, and review notes the owner
-- leaves in the CMS for the next release.

-- ───────────────────────── Stories ─────────────────────────
-- A story is a short illustrated scene sequence (characters, backgrounds,
-- lines with translations) followed by questions. Scenes are drawn by the app;
-- the row only says who stands where and what they say.
create table stories (
  id text primary key,
  level_code text not null references cefr_levels(code),
  title text not null check (char_length(btrim(title)) > 0),
  summary text not null default '',
  is_premium boolean not null default true,
  characters jsonb not null default '[]' check (jsonb_typeof(characters) = 'array'),
  scenes jsonb not null check (jsonb_typeof(scenes) = 'array' and jsonb_array_length(scenes) > 0)
);
alter table stories enable row level security;
revoke all on table stories from anon, authenticated;

-- Questions after a story hang off the story, as listening questions do.
alter table questions add column if not exists story_id text references stories(id) on delete cascade;
create index if not exists questions_story_idx on questions(story_id) where story_id is not null;
alter table questions drop constraint if exists questions_stage_check;
alter table questions add constraint questions_stage_check
  check (stage in ('guided','independent','homework','mastery','drill','exam','placement','listening','story'));

-- ───────────────────────── Review notes ─────────────────────────
-- The owner marks content that needs work while reviewing it in /admin; the
-- open notes are worked through together at the start of the next release.
create table content_notes (
  id bigint generated always as identity primary key,
  target_table text not null,
  target_id text not null check (char_length(btrim(target_id)) > 0),
  note text not null check (char_length(btrim(note)) between 1 and 2000),
  status text not null default 'open' check (status in ('open','resolved')),
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolution text
);
create index content_notes_open_idx on content_notes(status, created_at desc);
alter table content_notes enable row level security;
revoke all on table content_notes from anon, authenticated;

create or replace function admin_add_note(p_actor uuid, p_table text, p_target text, p_note text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_id bigint;
begin
  perform assert_admin(p_actor);
  perform cms_table(p_table);
  insert into content_notes (target_table, target_id, note, created_by)
  values (p_table, btrim(p_target), btrim(p_note), p_actor)
  returning id into v_id;
  return jsonb_build_object('id', v_id);
end $$;

create or replace function admin_list_notes(p_actor uuid, p_all boolean) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  perform assert_admin(p_actor);
  return (select coalesce(jsonb_agg(jsonb_build_object(
            'id', n.id, 'table', n.target_table, 'target', n.target_id, 'note', n.note, 'status', n.status,
            'created_at', n.created_at, 'resolved_at', n.resolved_at, 'resolution', n.resolution,
            'author', (select p.display_name from profiles p where p.id = n.created_by))
          order by n.status, n.created_at desc), '[]'::jsonb)
          from content_notes n where p_all or n.status = 'open');
end $$;

create or replace function admin_resolve_note(p_actor uuid, p_id bigint, p_resolution text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  perform assert_admin(p_actor);
  update content_notes set status = 'resolved', resolved_at = now(), resolution = nullif(btrim(coalesce(p_resolution, '')), '')
   where id = p_id and status = 'open';
  get diagnostics n = row_count;
  return jsonb_build_object('resolved', n);
end $$;

-- Lets the app check that this migration is in place before importing stories.
create or replace function content_features() returns jsonb
language sql immutable as $$ select '["stories","content_notes"]'::jsonb $$;

-- ───────────────────────── CMS functions, now aware of stories ─────────────────────────
create or replace function cms_table(p_table text) returns text
language plpgsql immutable as $$
begin
  if p_table not in ('cefr_levels','courses','chapters','units','grammar_topics','misconception_tags','lessons','questions','vocabulary',
                     'conversation_scenarios','listening_items','stories','pronunciation_guides','homework','exams','audio_resources','achievements') then
    raise exception 'unknown_table %', p_table using errcode = '22023';
  end if;
  return p_table;
end $$;

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
    'stories', (select coalesce(jsonb_agg(to_jsonb(t) order by t.level_code, t.id), '[]') from stories t),
    'pronunciation_guides', (select coalesce(jsonb_agg(to_jsonb(t) order by t.id), '[]') from pronunciation_guides t),
    'homework', (select coalesce(jsonb_agg(to_jsonb(h) || jsonb_build_object('question_ids',
        (select coalesce(jsonb_agg(hq.question_id order by hq.position), '[]') from homework_questions hq where hq.homework_id = h.id)) order by h.id), '[]') from homework h),
    'exams', (select coalesce(jsonb_agg(to_jsonb(x) || jsonb_build_object('question_ids',
        (select coalesce(jsonb_agg(xq.question_id order by xq.position), '[]') from exam_questions xq where xq.exam_id = x.id)) order by x.id), '[]') from exams x),
    'audio_resources', (select coalesce(jsonb_agg(to_jsonb(t) order by t.key), '[]') from audio_resources t),
    'achievements', (select coalesce(jsonb_agg(to_jsonb(t) order by t.id), '[]') from achievements t));
$$;

create or replace function import_content(p_actor uuid, p_rows jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r jsonb; t text; n int := 0;
begin
  if p_actor is not null then perform assert_admin(p_actor); end if;
  foreach t in array array['cefr_levels','courses','chapters','units','grammar_topics','misconception_tags','audio_resources','listening_items','stories',
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

-- Lock every function down to the service role, as at the end of 0004/0005/0007.
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.prokind = 'f' loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;
