-- 0012 (Rilis 6): recordings uploaded from /admin. The files go to the public
-- Supabase Storage bucket "audio" (written only by the server's secret key;
-- no client policies, so nobody can list or write it with the public key).
-- Each recording is a row in audio_resources with the text it reads; the app
-- plays it wherever that text is played, in the learner's accent.
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('audio', 'audio', true, 4194304,
            array['audio/mpeg','audio/mp4','audio/aac','audio/ogg','audio/webm','audio/wav','audio/flac'])
    on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit,
                                   allowed_mime_types = excluded.allowed_mime_types;
  end if;
end $$;

-- Saves (or replaces) the recording of one text in one accent; returns the URL it replaced.
create or replace function admin_save_recording(p_actor uuid, p_key text, p_accent text, p_url text, p_speaker text, p_transcript text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare old text;
begin
  perform assert_admin(p_actor);
  if p_key is null or p_key !~ '^rec\.[a-z0-9]{1,16}\.(us|uk)$' then raise exception 'invalid_key' using errcode = '22023'; end if;
  if p_accent is null or p_accent not in ('us', 'uk') or right(p_key, 2) <> p_accent then raise exception 'invalid_accent' using errcode = '22023'; end if;
  if coalesce(btrim(p_transcript), '') = '' or char_length(p_transcript) > 5000 then raise exception 'invalid_transcript' using errcode = '22023'; end if;
  if p_url is null or p_url !~ '^(https://|/)' then raise exception 'invalid_url' using errcode = '22023'; end if;
  select url into old from audio_resources where key = p_key;
  insert into audio_resources (key, accent, url, speaker, transcript)
  values (p_key, p_accent, p_url, nullif(btrim(coalesce(p_speaker, '')), ''), btrim(p_transcript))
  on conflict (key) do update set accent = excluded.accent, url = excluded.url, speaker = excluded.speaker,
                                  transcript = excluded.transcript, created_at = now();
  return jsonb_build_object('key', p_key, 'url', p_url, 'replaced', old);
end $$;

-- Deletes one recording row; returns its URL so the server can remove the file.
create or replace function admin_delete_recording(p_actor uuid, p_key text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare old text;
begin
  perform assert_admin(p_actor);
  delete from audio_resources where key = p_key returning url into old;
  return jsonb_build_object('deleted', old is not null, 'url', old);
end $$;

create or replace function content_features() returns jsonb
language sql immutable as $$ select '["stories","content_notes","level_exams","homework_reminders","branching_stories","audio_uploads"]'::jsonb $$;

-- Lock every function down to the service role, as at the end of 0004–0011.
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.prokind = 'f' loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;
