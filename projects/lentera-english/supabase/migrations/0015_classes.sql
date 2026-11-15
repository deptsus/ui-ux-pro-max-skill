-- 0015 (Rilis 10, "Kelas"): school licenses issued by the owner, teachers who
-- activate them with a license code, classes that students join with a class
-- code, assignments with deadlines, a progress view per student, and parents
-- linked by a one-time code the child creates. Students in a class with an
-- active license get Premium for as long as the license runs.

-- ───────────────────────── Licenses (owner) ─────────────────────────
create table school_licenses (
  id bigint generated always as identity primary key,
  code text not null unique check (code ~ '^[A-HJ-NP-Z2-9]{8}$'),
  school text not null check (char_length(school) between 2 and 120),
  contact text check (char_length(contact) <= 120),
  max_teachers int not null default 3 check (max_teachers between 1 and 200),
  max_classes int not null default 3 check (max_classes between 1 and 500),
  seats_per_class int not null default 40 check (seats_per_class between 1 and 500),
  starts_on date not null,
  ends_on date not null,
  note text check (char_length(note) <= 500),
  revoked boolean not null default false,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);

create table license_teachers (
  license_id bigint not null references school_licenses(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (license_id, user_id)
);
create index license_teachers_user_idx on license_teachers(user_id);

create table classes (
  id bigint generated always as identity primary key,
  license_id bigint not null references school_licenses(id) on delete cascade,
  teacher_id uuid not null references profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  level text references cefr_levels(code),
  join_code text not null unique check (join_code ~ '^[A-HJ-NP-Z2-9]{6}$'),
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
create index classes_teacher_idx on classes(teacher_id);
create index classes_license_idx on classes(license_id);

create table class_members (
  class_id bigint not null references classes(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, user_id)
);
create index class_members_user_idx on class_members(user_id);

-- Lessons, homework and unit exams from the published curriculum, with a deadline.
create table class_assignments (
  id bigint generated always as identity primary key,
  class_id bigint not null references classes(id) on delete cascade,
  kind text not null check (kind in ('lesson', 'homework', 'exam')),
  ref_id text not null check (char_length(ref_id) between 1 and 120),
  title text not null check (char_length(title) between 1 and 160),
  note text check (char_length(note) <= 500),
  due_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index class_assignments_class_idx on class_assignments(class_id, due_at);

-- ───────────────────────── Parents ─────────────────────────
create table parent_links (
  parent_id uuid not null references profiles(id) on delete cascade,
  child_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (parent_id, child_id),
  check (parent_id <> child_id)
);
create index parent_links_child_idx on parent_links(child_id);

-- One live code per child, valid 7 days, used once.
create table parent_codes (
  child_id uuid primary key references profiles(id) on delete cascade,
  code text not null unique check (code ~ '^[A-HJ-NP-Z2-9]{8}$'),
  expires_at timestamptz not null
);

alter table school_licenses enable row level security;
alter table license_teachers enable row level security;
alter table classes enable row level security;
alter table class_members enable row level security;
alter table class_assignments enable row level security;
alter table parent_links enable row level security;
alter table parent_codes enable row level security;
revoke all on table school_licenses, license_teachers, classes, class_members, class_assignments, parent_links, parent_codes from anon, authenticated;

-- Random code from the unambiguous alphabet (no 0/O, 1/I).
create or replace function random_code(p_len int) returns text
language plpgsql volatile set search_path = public as $$
declare c text := ''; alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; i int;
begin
  for i in 1..p_len loop c := c || substr(alphabet, 1 + floor(random() * 32)::int, 1); end loop;
  return c;
end $$;

create or replace function license_active(l school_licenses) returns boolean
language sql stable set search_path = public as $$
  select not l.revoked and (now() at time zone 'Asia/Jakarta')::date between l.starts_on and l.ends_on;
$$;

-- ───────────────────────── Premium for classes ─────────────────────────
-- Same as 0007, plus: students in a class (and its teachers) under an active
-- license get Premium until the license ends. A paid subscription still wins
-- when it runs longer.
create or replace function get_entitlement(p_user uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  with paid as (select max(expires_at) as expires_at from subscriptions where user_id = p_user and expires_at > now()),
  school as (
    select max(((l.ends_on + 1)::timestamp at time zone 'Asia/Jakarta')) as expires_at,
           bool_or(t.user_id is not null) as teacher
    from school_licenses l
    left join license_teachers t on t.license_id = l.id and t.user_id = p_user
    where license_active(l)
      and (t.user_id is not null
           or exists (select 1 from classes c join class_members m on m.class_id = c.id
                      where c.license_id = l.id and not c.archived and m.user_id = p_user))
  )
  select case
    when exists (select 1 from profiles where id = p_user and role = 'admin')
      then jsonb_build_object('premium', true, 'plan', 'admin', 'expires_at', null)
    when paid.expires_at is not null and (school.expires_at is null or paid.expires_at >= school.expires_at)
      then jsonb_build_object('premium', true, 'expires_at', paid.expires_at,
             'plan', (select s.plan_id from subscriptions s where s.user_id = p_user and s.expires_at > now() order by s.starts_at limit 1))
    when school.expires_at is not null
      then jsonb_build_object('premium', true, 'expires_at', school.expires_at, 'plan', case when school.teacher then 'teacher' else 'class' end)
    else jsonb_build_object('premium', false, 'plan', 'free', 'expires_at', null)
  end
  from paid, school;
$$;

-- ───────────────────────── Owner: licenses ─────────────────────────
create or replace function admin_create_license(p_actor uuid, p_school text, p_contact text, p_max_teachers int, p_max_classes int,
                                                p_seats int, p_starts date, p_ends date, p_note text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare l school_licenses; c text;
begin
  perform assert_admin(p_actor);
  loop
    c := random_code(8);
    exit when not exists (select 1 from school_licenses where code = c);
  end loop;
  insert into school_licenses (code, school, contact, max_teachers, max_classes, seats_per_class, starts_on, ends_on, note, created_by)
  values (c, btrim(p_school), nullif(btrim(coalesce(p_contact, '')), ''), p_max_teachers, p_max_classes, p_seats, p_starts, p_ends,
          nullif(btrim(coalesce(p_note, '')), ''), p_actor)
  returning * into l;
  return to_jsonb(l);
end $$;

create or replace function admin_update_license(p_actor uuid, p_id bigint, p_patch jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare l school_licenses;
begin
  perform assert_admin(p_actor);
  update school_licenses set
    ends_on = coalesce((p_patch->>'ends_on')::date, ends_on),
    max_teachers = coalesce((p_patch->>'max_teachers')::int, max_teachers),
    max_classes = coalesce((p_patch->>'max_classes')::int, max_classes),
    seats_per_class = coalesce((p_patch->>'seats_per_class')::int, seats_per_class),
    revoked = coalesce((p_patch->>'revoked')::boolean, revoked),
    note = case when p_patch ? 'note' then nullif(btrim(coalesce(p_patch->>'note', '')), '') else note end
  where id = p_id returning * into l;
  if not found then raise exception 'not_found' using errcode = '22023'; end if;
  return to_jsonb(l);
end $$;

create or replace function admin_licenses(p_actor uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  perform assert_admin(p_actor);
  return coalesce((select jsonb_agg(x order by x.created_at desc) from (
    select l.*, license_active(l) as active,
           (select count(*) from license_teachers t where t.license_id = l.id) as teachers,
           (select count(*) from classes c where c.license_id = l.id and not c.archived) as classes,
           (select count(*) from classes c join class_members m on m.class_id = c.id where c.license_id = l.id and not c.archived) as students,
           (select coalesce(jsonb_agg(p.display_name order by p.display_name), '[]'::jsonb) from license_teachers t join profiles p on p.id = t.user_id where t.license_id = l.id) as teacher_names
    from school_licenses l) x), '[]'::jsonb);
end $$;

-- ───────────────────────── Teachers ─────────────────────────
-- Returns { school } or { error: code_not_found | license_inactive | teacher_limit }.
create or replace function teacher_activate(p_user uuid, p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare l school_licenses;
begin
  perform get_account(p_user);
  select * into l from school_licenses where code = upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  if not found then return jsonb_build_object('error', 'code_not_found'); end if;
  if not license_active(l) then return jsonb_build_object('error', 'license_inactive'); end if;
  if exists (select 1 from license_teachers where license_id = l.id and user_id = p_user) then return jsonb_build_object('school', l.school, 'already', true); end if;
  if (select count(*) from license_teachers where license_id = l.id) >= l.max_teachers then return jsonb_build_object('error', 'teacher_limit'); end if;
  insert into license_teachers (license_id, user_id) values (l.id, p_user);
  return jsonb_build_object('school', l.school);
end $$;

create or replace function is_class_teacher(p_user uuid, p_class bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from classes c join license_teachers t on t.license_id = c.license_id and t.user_id = p_user
                 where c.id = p_class and c.teacher_id = p_user);
$$;

-- Everything the teacher page needs: licenses, classes with counts.
create or replace function teacher_overview(p_user uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  return jsonb_build_object(
    'licenses', coalesce((select jsonb_agg(jsonb_build_object('id', l.id, 'school', l.school, 'ends_on', l.ends_on, 'active', license_active(l),
                  'max_classes', l.max_classes, 'seats_per_class', l.seats_per_class,
                  'classes_used', (select count(*) from classes c where c.license_id = l.id and not c.archived)) order by l.ends_on desc)
                  from school_licenses l join license_teachers t on t.license_id = l.id and t.user_id = p_user), '[]'::jsonb),
    'classes', coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name, 'level', c.level, 'join_code', c.join_code, 'archived', c.archived,
                  'license_id', c.license_id, 'school', l.school, 'license_active', license_active(l),
                  'students', (select count(*) from class_members m where m.class_id = c.id),
                  'open_assignments', (select count(*) from class_assignments a where a.class_id = c.id and a.due_at > now())) order by c.archived, c.created_at desc)
                  from classes c join school_licenses l on l.id = c.license_id where c.teacher_id = p_user), '[]'::jsonb));
end $$;

-- Returns { id, join_code } or { error: not_teacher | license_inactive | class_limit }.
create or replace function create_class(p_user uuid, p_license bigint, p_name text, p_level text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare l school_licenses; v_code text; v_id bigint;
begin
  select * into l from school_licenses sl where sl.id = p_license;
  if not found or not exists (select 1 from license_teachers where license_id = p_license and user_id = p_user) then return jsonb_build_object('error', 'not_teacher'); end if;
  if not license_active(l) then return jsonb_build_object('error', 'license_inactive'); end if;
  if (select count(*) from classes where license_id = p_license and not archived) >= l.max_classes then return jsonb_build_object('error', 'class_limit'); end if;
  loop
    v_code := random_code(6);
    exit when not exists (select 1 from classes where join_code = v_code);
  end loop;
  insert into classes (license_id, teacher_id, name, level, join_code)
  values (p_license, p_user, btrim(p_name), (select cl.code from cefr_levels cl where cl.code = p_level), v_code)
  returning classes.id into v_id;
  return jsonb_build_object('id', v_id, 'join_code', v_code);
end $$;

create or replace function update_class(p_user uuid, p_class bigint, p_patch jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_code text;
begin
  if not is_class_teacher(p_user, p_class) then return jsonb_build_object('error', 'not_teacher'); end if;
  if p_patch ? 'name' then update classes set name = btrim(p_patch->>'name') where id = p_class; end if;
  if p_patch ? 'level' then update classes set level = (select cl.code from cefr_levels cl where cl.code = p_patch->>'level') where id = p_class; end if;
  if p_patch ? 'archived' then update classes set archived = (p_patch->>'archived')::boolean where id = p_class; end if;
  if coalesce((p_patch->>'new_code')::boolean, false) then
    loop
      v_code := random_code(6);
      exit when not exists (select 1 from classes where join_code = v_code);
    end loop;
    update classes set join_code = v_code where id = p_class;
  end if;
  return jsonb_build_object('ok', true);
end $$;

-- Done = a learning_history event for that lesson/homework/exam after the assignment was given.
create or replace function assignment_result(p_user uuid, a class_assignments) returns jsonb
language sql stable security definer set search_path = public as $$
  select (select jsonb_build_object('at', h.occurred_at, 'score', h.score, 'late', h.occurred_at > a.due_at)
          from learning_history h
          where h.user_id = p_user and h.event_type = a.kind and h.ref_id = a.ref_id and h.occurred_at >= a.created_at - interval '1 day'
          order by h.occurred_at limit 1);
$$;

-- Roster with progress and the class's assignments, for its teacher.
create or replace function class_detail(p_user uuid, p_class bigint) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare wk date := league_week(now()); c classes;
begin
  if not is_class_teacher(p_user, p_class) then raise exception 'forbidden' using errcode = '42501'; end if;
  select * into c from classes where id = p_class;
  return jsonb_build_object(
    'class', (select jsonb_build_object('id', c.id, 'name', c.name, 'level', c.level, 'join_code', c.join_code, 'archived', c.archived, 'school', l.school,
                'seats', l.seats_per_class, 'license_active', license_active(l), 'ends_on', l.ends_on) from school_licenses l where l.id = c.license_id),
    'assignments', coalesce((select jsonb_agg(jsonb_build_object('id', a.id, 'kind', a.kind, 'ref_id', a.ref_id, 'title', a.title, 'note', a.note,
                    'due_at', a.due_at, 'created_at', a.created_at,
                    'done', (select count(*) from class_members m where m.class_id = c.id and assignment_result(m.user_id, a) is not null)) order by a.due_at desc)
                    from class_assignments a where a.class_id = c.id), '[]'::jsonb),
    'students', coalesce((select jsonb_agg(x order by x.name) from (
        select p.id, p.display_name as name, p.avatar, p.placement_level as level, m.joined_at,
               week_xp(p.id, wk) as xp_week,
               (select coalesce(sum(amount), 0) from xp_transactions x where x.user_id = p.id) as xp_total,
               (select count(distinct ref_id) from learning_history h where h.user_id = p.id and h.event_type = 'lesson') as lessons,
               (select round(avg(score)) from mastery_records r where r.user_id = p.id and r.attempts > 0) as mastery,
               live_streak(p.id) as streak,
               (select max(occurred_at) from xp_transactions x where x.user_id = p.id) as last_active,
               coalesce((select jsonb_object_agg(a.id::text, assignment_result(p.id, a)) from class_assignments a where a.class_id = c.id), '{}'::jsonb) as results
        from class_members m join profiles p on p.id = m.user_id where m.class_id = c.id) x), '[]'::jsonb));
end $$;

create or replace function add_assignment(p_user uuid, p_class bigint, p_kind text, p_ref text, p_title text, p_note text, p_due timestamptz) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_id bigint;
begin
  if not is_class_teacher(p_user, p_class) then return jsonb_build_object('error', 'not_teacher'); end if;
  if p_due <= now() then return jsonb_build_object('error', 'past_due'); end if;
  if (select count(*) from class_assignments where class_id = p_class) >= 300 then return jsonb_build_object('error', 'too_many'); end if;
  insert into class_assignments (class_id, kind, ref_id, title, note, due_at)
  values (p_class, p_kind, p_ref, btrim(p_title), nullif(btrim(coalesce(p_note, '')), ''), p_due)
  returning class_assignments.id into v_id;
  return jsonb_build_object('id', v_id);
end $$;

create or replace function delete_assignment(p_user uuid, p_id bigint) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  delete from class_assignments a where a.id = p_id and is_class_teacher(p_user, a.class_id);
  return jsonb_build_object('deleted', found);
end $$;

create or replace function remove_student(p_user uuid, p_class bigint, p_student uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not is_class_teacher(p_user, p_class) then return jsonb_build_object('error', 'not_teacher'); end if;
  delete from class_members where class_id = p_class and user_id = p_student;
  return jsonb_build_object('removed', found);
end $$;

-- ───────────────────────── Students ─────────────────────────
-- Returns { name, school, teacher } or { error: code_not_found | class_closed | class_full }.
create or replace function join_class(p_user uuid, p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare c classes; l school_licenses;
begin
  perform get_account(p_user);
  select * into c from classes where join_code = upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  if not found then return jsonb_build_object('error', 'code_not_found'); end if;
  select * into l from school_licenses where id = c.license_id;
  if c.archived or not license_active(l) then return jsonb_build_object('error', 'class_closed'); end if;
  if exists (select 1 from class_members where class_id = c.id and user_id = p_user) then
    return jsonb_build_object('name', c.name, 'school', l.school, 'already', true);
  end if;
  if (select count(*) from class_members where class_id = c.id) >= l.seats_per_class then return jsonb_build_object('error', 'class_full'); end if;
  insert into class_members (class_id, user_id) values (c.id, p_user);
  return jsonb_build_object('name', c.name, 'school', l.school, 'teacher', (select display_name from profiles where id = c.teacher_id));
end $$;

create or replace function leave_class(p_user uuid, p_class bigint) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  delete from class_members where class_id = p_class and user_id = p_user;
  return jsonb_build_object('left', found);
end $$;

-- The student's classes and assignments, with their own result for each.
create or replace function my_classes(p_user uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', c.id, 'name', c.name, 'level', c.level, 'school', l.school, 'teacher', t.display_name, 'active', license_active(l) and not c.archived,
    'assignments', coalesce((select jsonb_agg(jsonb_build_object('id', a.id, 'kind', a.kind, 'ref_id', a.ref_id, 'title', a.title, 'note', a.note,
                    'due_at', a.due_at, 'result', assignment_result(p_user, a)) order by a.due_at)
                    from class_assignments a where a.class_id = c.id and a.due_at > now() - interval '30 days'), '[]'::jsonb)) order by m.joined_at desc), '[]'::jsonb)
  from class_members m join classes c on c.id = m.class_id join school_licenses l on l.id = c.license_id join profiles t on t.id = c.teacher_id
  where m.user_id = p_user;
$$;

-- ───────────────────────── Parents ─────────────────────────
create or replace function parent_code(p_child uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare c text;
begin
  perform get_account(p_child);
  loop
    c := random_code(8);
    exit when not exists (select 1 from parent_codes where code = c);
  end loop;
  insert into parent_codes (child_id, code, expires_at) values (p_child, c, now() + interval '7 days')
  on conflict (child_id) do update set code = excluded.code, expires_at = excluded.expires_at;
  return jsonb_build_object('code', c, 'expires_at', now() + interval '7 days');
end $$;

-- Returns { name } or { error: code_not_found | own_code | parent_limit }.
create or replace function link_parent(p_parent uuid, p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare pc parent_codes;
begin
  perform get_account(p_parent);
  select * into pc from parent_codes where code = upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g')) and expires_at > now();
  if not found then return jsonb_build_object('error', 'code_not_found'); end if;
  if pc.child_id = p_parent then return jsonb_build_object('error', 'own_code'); end if;
  if (select count(*) from parent_links where child_id = pc.child_id) >= 3 then return jsonb_build_object('error', 'parent_limit'); end if;
  insert into parent_links (parent_id, child_id) values (p_parent, pc.child_id) on conflict do nothing;
  delete from parent_codes where child_id = pc.child_id;
  return jsonb_build_object('name', (select display_name from profiles where id = pc.child_id));
end $$;

-- Either side can end the link (the parent by child id, the child by parent id).
create or replace function unlink_parent(p_user uuid, p_other uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  delete from parent_links where (parent_id = p_user and child_id = p_other) or (child_id = p_user and parent_id = p_other);
  return jsonb_build_object('removed', found);
end $$;

-- For the child's profile: who can see their progress.
create or replace function my_parents(p_child uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', p.id, 'name', p.display_name, 'since', l.created_at) order by l.created_at), '[]'::jsonb)
  from parent_links l join profiles p on p.id = l.parent_id where l.child_id = p_child;
$$;

-- For the parent: each linked child's week, streak, homework and classes.
create or replace function parent_overview(p_parent uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', p.id, 'name', p.display_name, 'avatar', p.avatar, 'level', p.placement_level,
    'streak', live_streak(p.id),
    'xp_week', week_xp(p.id, league_week(now())),
    'last_active', (select max(occurred_at) from xp_transactions x where x.user_id = p.id),
    'lessons', (select count(distinct ref_id) from learning_history h where h.user_id = p.id and h.event_type = 'lesson'),
    'lessons_week', (select count(*) from learning_history h where h.user_id = p.id and h.event_type = 'lesson' and h.occurred_at > now() - interval '7 days'),
    'days_active_week', (select count(distinct (occurred_at at time zone 'Asia/Jakarta')::date) from xp_transactions x where x.user_id = p.id and x.occurred_at > now() - interval '7 days'),
    'homework', (select jsonb_build_object(
        'open', count(*) filter (where coalesce(jsonb_array_length(case when jsonb_typeof(h.value->'submissions') = 'array' then h.value->'submissions' end), 0) = 0 and safe_bigint(h.value->>'dueAt') > floor(extract(epoch from now()) * 1000)),
        'overdue', count(*) filter (where coalesce(jsonb_array_length(case when jsonb_typeof(h.value->'submissions') = 'array' then h.value->'submissions' end), 0) = 0 and safe_bigint(h.value->>'dueAt') <= floor(extract(epoch from now()) * 1000)))
      from learner_snapshots s cross join lateral jsonb_each(case when jsonb_typeof(s.state->'homework') = 'object' then s.state->'homework' else '{}'::jsonb end) h
      where s.user_id = p.id and jsonb_typeof(h.value) = 'object'),
    'certificates', (select coalesce(jsonb_agg(jsonb_build_object('level', c.level_code, 'code', c.code, 'issued_at', c.issued_at) order by c.issued_at desc), '[]'::jsonb) from certificates c where c.user_id = p.id),
    'classes', my_classes(p.id)) order by p.display_name), '[]'::jsonb)
  from parent_links l join profiles p on p.id = l.child_id where l.parent_id = p_parent;
$$;

-- Parent codes are short-lived secrets: keep them out of the daily backup.
create or replace function backup_tables() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(table_name order by table_name), '[]'::jsonb)
  from information_schema.tables
  where table_schema = 'public' and table_type = 'BASE TABLE'
    and table_name not in ('rate_limits', 'job_runs', 'push_keys', 'homework_reminders', 'friend_code_attempts', 'app_errors', 'backup_runs', 'parent_codes');
$$;

create or replace function content_features() returns jsonb
language sql immutable set search_path = public as $$ select '["stories","content_notes","level_exams","homework_reminders","branching_stories","audio_uploads","habits","ops","classes"]'::jsonb $$;

-- Lock every function down to the service role, as at the end of 0004–0014.
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.prokind = 'f' loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;
