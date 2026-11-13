-- Lentera English: normalized schema.
-- Content tables are edited through the CMS and served as a published snapshot.
-- Learner tables are written only by server-side functions (see 0003, 0004).

-- ───────────────────────── Curriculum ─────────────────────────
create table cefr_levels (
  code text primary key check (code in ('A1','A2','B1','B2','C1','C2')),
  title text not null,
  description text not null default '',
  position int not null unique,
  exam_pass_score int not null default 80 check (exam_pass_score between 50 and 100)
);

create table courses (
  id text primary key,
  level_code text not null unique references cefr_levels(code),
  title text not null,
  description text not null default ''
);

create table chapters (
  id text primary key,
  course_id text not null references courses(id) on delete cascade,
  position int not null check (position > 0),
  title text not null,
  description text not null default '',
  is_premium boolean not null default true,
  is_planned boolean not null default false,
  unique (course_id, position)
);

create table units (
  id text primary key,
  chapter_id text not null references chapters(id) on delete cascade,
  position int not null check (position > 0),
  title text not null,
  description text,
  exam_pass_score int not null default 80 check (exam_pass_score between 50 and 100),
  planned_lessons jsonb not null default '[]' check (jsonb_typeof(planned_lessons) = 'array'),
  unique (chapter_id, position)
);

create table grammar_topics (
  id text primary key,
  kind text not null default 'grammar' check (kind in ('grammar','vocabulary','skill')),
  level_code text not null references cefr_levels(code),
  title text not null,
  summary text not null default '',
  lesson_id text
);

create table misconception_tags (
  id text primary key,
  topic_id text not null references grammar_topics(id) on delete cascade,
  title text not null,
  tip text not null
);

create table lessons (
  id text primary key,
  unit_id text not null references units(id) on delete cascade,
  position int not null check (position > 0),
  title text not null check (char_length(title) > 0),
  summary text not null default '',
  topic_id text not null references grammar_topics(id),
  is_premium boolean not null default true,
  passing_score int not null default 85 check (passing_score between 50 and 100),
  status text not null default 'draft' check (status in ('draft','published')),
  intro text not null default '',
  teaching jsonb not null default '[]' check (jsonb_typeof(teaching) = 'array'),
  demo jsonb not null default '[]' check (jsonb_typeof(demo) = 'array'),
  vocab jsonb not null default '[]' check (jsonb_typeof(vocab) = 'array'),
  updated_at timestamptz not null default now()
);
create index lessons_unit_idx on lessons(unit_id, position);

create table learning_objectives (
  id bigint generated always as identity primary key,
  lesson_id text not null references lessons(id) on delete cascade,
  position int not null,
  body text not null check (char_length(body) > 0),
  unique (lesson_id, position)
);

create table audio_resources (
  key text primary key,
  accent text not null check (accent in ('us','uk')),
  url text not null check (url ~ '^(https://|/)'),
  speaker text,
  transcript text,
  created_at timestamptz not null default now()
);

create table listening_items (
  id text primary key,
  level_code text not null references cefr_levels(code),
  title text not null,
  kind text not null check (kind in ('sentence','word','passage')),
  transcript text not null,
  translation text not null default '',
  is_premium boolean not null default true,
  audio_key text references audio_resources(key) on delete set null
);

create table questions (
  id text primary key,
  lesson_id text references lessons(id) on delete cascade,
  listening_item_id text references listening_items(id) on delete cascade,
  stage text not null check (stage in ('guided','independent','homework','mastery','drill','exam','placement','listening')),
  position int not null default 0,
  type text not null check (type in ('mc','fill','arrange','construct','match','translate','fix','listen','read','dialogue','tf','spot','vocab','para')),
  topic_id text not null references grammar_topics(id),
  focus_tag text references misconception_tags(id) on delete set null,
  difficulty int not null check (difficulty between 1 and 5),
  prompt text not null check (char_length(prompt) > 0),
  explanation text not null check (char_length(btrim(explanation)) > 0),
  hint text,
  time_limit_sec int check (time_limit_sec between 3 and 600),
  audio_key text references audio_resources(key) on delete set null,
  cefr_level text references cefr_levels(code),
  -- Type-specific fields: text, context, answers, errors, tiles, pairs,
  -- sentences, wrongWord, correction, audioText.
  payload jsonb not null default '{}' check (jsonb_typeof(payload) = 'object'),
  status text not null default 'published' check (status in ('draft','published'))
);
create index questions_lesson_idx on questions(lesson_id, stage, position);
create index questions_topic_idx on questions(topic_id);

create table answer_options (
  id bigint generated always as identity primary key,
  question_id text not null references questions(id) on delete cascade,
  position int not null,
  body text not null check (char_length(body) > 0),
  is_correct boolean not null default false,
  -- Why this option is wrong. Mandatory for every incorrect option.
  feedback text,
  misconception_tag text references misconception_tags(id) on delete set null,
  unique (question_id, position),
  check (is_correct or char_length(btrim(coalesce(feedback, ''))) > 0)
);
create unique index answer_options_one_correct on answer_options(question_id) where is_correct;

create table vocabulary (
  id text primary key,
  word text not null,
  ipa text not null,
  part_of_speech text not null,
  meaning text not null,
  example text not null,
  example_translation text not null,
  level_code text not null references cefr_levels(code),
  set_name text not null,
  is_premium boolean not null default true,
  audio_key text references audio_resources(key) on delete set null
);

create table conversation_scenarios (
  id text primary key,
  title text not null,
  level_code text not null references cefr_levels(code),
  setting text not null,
  goal text not null,
  closing text not null,
  is_premium boolean not null default true,
  start_node text not null,
  nodes jsonb not null check (jsonb_typeof(nodes) = 'array' and jsonb_array_length(nodes) > 0)
);

create table pronunciation_guides (
  id text primary key,
  ipa text not null,
  label text not null,
  examples jsonb not null default '[]',
  how_to text not null,
  common_error text not null,
  mouth jsonb not null default '{}'
);

create table homework (
  id text primary key,
  chapter_id text not null references chapters(id) on delete cascade,
  lesson_id text references lessons(id) on delete cascade,
  title text not null,
  kind text not null check (kind in ('vocabulary','grammar','translation','reading','listening','construction','writing')),
  due_days int not null default 3 check (due_days between 1 and 60),
  available_from date,
  writing jsonb
);
create table homework_questions (
  homework_id text not null references homework(id) on delete cascade,
  question_id text not null references questions(id) on delete cascade,
  position int not null,
  primary key (homework_id, question_id)
);

create table exams (
  id text primary key,
  scope text not null check (scope in ('unit','level','placement')),
  ref text not null,
  title text not null,
  passing_score int not null default 80 check (passing_score between 50 and 100),
  time_limit_sec int not null default 900 check (time_limit_sec between 60 and 7200),
  is_premium boolean not null default false,
  sample_size int not null default 10 check (sample_size between 0 and 60)
);
create table exam_questions (
  exam_id text not null references exams(id) on delete cascade,
  question_id text not null references questions(id) on delete cascade,
  position int not null,
  primary key (exam_id, question_id)
);

create table curriculum_versions (
  id bigint generated always as identity primary key,
  label text not null,
  notes text not null default '',
  is_current boolean not null default false,
  snapshot jsonb not null,
  published_by uuid,
  published_at timestamptz not null default now()
);
create unique index curriculum_versions_one_current on curriculum_versions(is_current) where is_current;

-- ───────────────────────── Users ─────────────────────────
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Pelajar' check (char_length(display_name) between 1 and 40),
  role text not null default 'student' check (role in ('student','admin')),
  avatar int not null default 0 check (avatar between 0 and 20),
  daily_goal_xp int not null default 40 check (daily_goal_xp between 10 and 500),
  accent text not null default 'us' check (accent in ('us','uk')),
  placement_level text references cefr_levels(code),
  created_at timestamptz not null default now()
);

create table exercise_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  client_event_id text not null,
  question_id text not null,
  topic_id text not null,
  is_correct boolean not null,
  misconception_tag text,
  response_ms int not null check (response_ms >= 0),
  context text not null,
  difficulty int not null check (difficulty between 1 and 5),
  used_hint boolean not null default false,
  answer_given text,
  attempted_at timestamptz not null,
  unique (user_id, client_event_id)
);
create index exercise_attempts_user_topic_idx on exercise_attempts(user_id, topic_id, attempted_at desc);

create table mastery_records (
  user_id uuid not null references profiles(id) on delete cascade,
  topic_id text not null,
  score int not null check (score between 0 and 100),
  stage text not null check (stage in ('new','learning','practicing','provisional','mastered','needs-review')),
  attempts int not null default 0,
  correct int not null default 0,
  provisional_at timestamptz,
  retest_due_at timestamptz,
  mastered_at timestamptz,
  last_attempt_at timestamptz,
  primary key (user_id, topic_id)
);

create table review_schedules (
  user_id uuid not null references profiles(id) on delete cascade,
  item_key text not null,
  step int not null check (step >= 0),
  interval_days int not null check (interval_days > 0),
  due_at timestamptz not null,
  lapses int not null default 0,
  primary key (user_id, item_key)
);
create index review_schedules_due_idx on review_schedules(user_id, due_at);

create table review_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  client_event_id text not null,
  item_key text not null,
  is_correct boolean not null,
  interval_before int not null,
  interval_after int not null,
  reviewed_at timestamptz not null,
  unique (user_id, client_event_id)
);

create table lesson_progress (
  user_id uuid not null references profiles(id) on delete cascade,
  lesson_id text not null,
  step int not null default 0,
  mastery_best int not null default 0 check (mastery_best between 0 and 100),
  mastery_attempts int not null default 0,
  completed_at timestamptz,
  primary key (user_id, lesson_id)
);

create table learning_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  client_event_id text not null,
  event_type text not null check (event_type in ('lesson','exam','homework')),
  ref_id text not null,
  score int check (score between 0 and 100),
  passed boolean,
  is_late boolean,
  occurred_at timestamptz not null,
  unique (user_id, client_event_id)
);
create index learning_history_user_idx on learning_history(user_id, occurred_at desc);

create table xp_transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  client_event_id text not null,
  amount int not null check (amount between 1 and 200),
  reason text not null,
  ref_id text,
  occurred_at timestamptz not null,
  unique (user_id, client_event_id)
);
create index xp_transactions_time_idx on xp_transactions(occurred_at, user_id);

create table streaks (
  user_id uuid primary key references profiles(id) on delete cascade,
  current_streak int not null default 0 check (current_streak >= 0),
  longest_streak int not null default 0 check (longest_streak >= 0),
  last_active_date date,
  freezes int not null default 1 check (freezes between 0 and 3)
);

create table achievements (
  id text primary key,
  title text not null,
  description text not null,
  icon text not null default 'award'
);
create table user_achievements (
  user_id uuid not null references profiles(id) on delete cascade,
  achievement_id text not null references achievements(id) on delete cascade,
  earned_at timestamptz not null,
  primary key (user_id, achievement_id)
);

-- Device-restore cache of the client state (the normalized tables above are
-- the system of record for analytics; this lets a new device resume instantly).
create table learner_snapshots (
  user_id uuid primary key references profiles(id) on delete cascade,
  state jsonb not null,
  client_updated_at bigint not null,
  updated_at timestamptz not null default now()
);

-- ───────────────────────── Billing ─────────────────────────
create table subscription_plans (
  id text primary key,
  name text not null,
  price_idr int not null check (price_idr >= 0),
  duration_days int not null check (duration_days >= 0),
  is_active boolean not null default true
);

create table payment_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete restrict,
  plan_id text not null references subscription_plans(id),
  reference_id text not null unique,
  amount_idr int not null check (amount_idr > 0),
  currency text not null default 'IDR' check (currency = 'IDR'),
  channel text not null check (channel in ('QRIS','DANA','GOPAY')),
  status text not null default 'PENDING' check (status in ('PENDING','SUCCEEDED','FAILED','EXPIRED','CANCELED','NEEDS_REVIEW')),
  gateway_payment_request_id text unique,
  gateway_payment_id text,
  -- What the customer needs to pay: {type, descriptor, value}. No account data.
  checkout jsonb,
  expires_at timestamptz,
  paid_at timestamptz,
  failure_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payment_transactions_user_idx on payment_transactions(user_id, created_at desc);
create index payment_transactions_status_idx on payment_transactions(status, created_at desc);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  plan_id text not null references subscription_plans(id),
  starts_at timestamptz not null,
  expires_at timestamptz not null,
  -- One payment can create at most one subscription period.
  source_transaction_id uuid not null unique references payment_transactions(id),
  created_at timestamptz not null default now(),
  check (expires_at > starts_at)
);
create index subscriptions_user_idx on subscriptions(user_id, expires_at desc);

create table payment_webhook_events (
  id bigint generated always as identity primary key,
  -- De-duplication key derived from the event and gateway payment id.
  event_key text not null unique,
  source text not null check (source in ('webhook','reconcile')),
  event_type text not null,
  reference_id text,
  transaction_id uuid references payment_transactions(id),
  outcome text not null default 'received',
  detail text,
  duplicate_count int not null default 0,
  payload jsonb not null default '{}',
  received_at timestamptz not null default now()
);
create index payment_webhook_events_time_idx on payment_webhook_events(received_at desc);

-- ───────────────────────── Reference data ─────────────────────────
insert into cefr_levels (code, title, description, position) values
  ('A1','Pemula','',1),('A2','Dasar','',2),('B1','Menengah','',3),
  ('B2','Menengah Atas','',4),('C1','Mahir','',5),('C2','Sangat Mahir','',6);

insert into subscription_plans (id, name, price_idr, duration_days) values
  ('free', 'Free', 0, 0),
  ('premium_monthly', 'Premium Bulanan', 58500, 30),
  ('premium_yearly', 'Premium Tahunan', 585000, 365);
