-- 0019 (Rilis 15 "Pelajaran Interaktif"): four new exercise types.
--   picture  – choose a picture (options carry an illustration key in payload.pics)
--   scene    – place an object in a scene (prepositions); options are the spots
--   timeline – tap when an action happens (past / now / future); options are the zones
--   spell    – build a word from letter tiles (typed answer, like fill)
-- No learner data changes; only the allowed types and the publish quality gate.
alter table questions drop constraint questions_type_check;
alter table questions add constraint questions_type_check
  check (type in ('mc','fill','arrange','construct','match','translate','fix','listen','read','dialogue','tf','spot','vocab','para','picture','scene','timeline','spell'));

-- Same quality gate as 0003, with the new choice types (exactly one correct option)
-- and spelling (needs an answer key).
create or replace function publish_curriculum(p_actor uuid, p_label text, p_notes text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare problems text[]; v_id bigint;
begin
  if p_actor is not null then perform assert_admin(p_actor); end if;

  select array_agg(msg) into problems from (
    select format('%s: pilihan ganda harus punya tepat satu jawaban benar', q.id) as msg
      from questions q
     where q.status = 'published' and q.type in ('mc','vocab','dialogue','read','listen','tf','picture','scene','timeline')
       and (select count(*) from answer_options a where a.question_id = q.id and a.is_correct) <> 1
    union all
    select format('%s: belum ada kunci jawaban', q.id)
      from questions q
     where q.status = 'published' and q.type in ('fill','arrange','construct','translate','fix','spell')
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

create or replace function content_features() returns jsonb
language sql immutable set search_path = public as $$ select '["stories","content_notes","level_exams","homework_reminders","branching_stories","audio_uploads","habits","ops","classes","tracks","exam_timing","interactive"]'::jsonb $$;

-- Lock every function down to the service role, as at the end of 0004–0017.
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.prokind = 'f' loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;
