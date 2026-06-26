-- ═══════════════════════════════════════════════════════════
-- ICU Steward 2.0 — Master Setup
-- Paste this entire file into Supabase SQL Editor and run once.
-- ═══════════════════════════════════════════════════════════

-- ── 1. Extension ─────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── 2. Tables ────────────────────────────────────────────

-- Hospitals ───────────────────────────────────────────────
create table if not exists hospitals (
  id            text primary key,
  name          text not null,
  city          text,
  beds          integer default 0,
  plan          text,
  sync_status   text default 'Live',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Users ───────────────────────────────────────────────────
create table if not exists users (
  id              text primary key,
  hospital_id     text not null references hospitals(id),
  name            text not null,
  email           text unique,
  password_hash   text,
  role            text not null,
  unit            text,
  status          text default 'Active',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Patients ────────────────────────────────────────────────
create table if not exists patients (
  id                      text primary key,
  hospital_id             text not null references hospitals(id),
  uhid                    text,
  name                    text not null,
  age                     integer,
  gender                  text,
  bed                     text,
  consultant              text,
  diagnosis               text,
  admission_date          timestamptz,
  expected_discharge      timestamptz,
  status                  text default 'Stable',
  priority                text default 'Medium',
  notes                   text,
  current_antibiotics     jsonb default '[]'::jsonb,
  pending_investigations  jsonb default '[]'::jsonb,
  completed_investigations jsonb default '[]'::jsonb,
  devices                 jsonb default '[]'::jsonb,
  daily_checklist         jsonb default '{}'::jsonb,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- Investigations ──────────────────────────────────────────
create table if not exists investigations (
  id                    text primary key,
  hospital_id           text not null references hospitals(id),
  patient_id            text not null references patients(id),
  patient_name          text,
  name                  text not null,
  lab_name              text,
  priority              text default 'Medium',
  status                text default 'Pending',
  sent_date             timestamptz,
  expected_report_date  timestamptz,
  category              text,
  reminder_every_hours  integer,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Antibiotics ─────────────────────────────────────────────
create table if not exists antibiotics (
  id                text primary key,
  hospital_id       text not null references hospitals(id),
  patient_id        text not null references patients(id),
  patient_name      text,
  drug_name         text not null,
  dose              text,
  route             text,
  frequency         text,
  start_date        timestamptz,
  indication        text,
  expected_duration text,
  review_date       timestamptz,
  culture_linked    text,
  status            text default 'Active',
  action            text,
  day               integer,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Devices ─────────────────────────────────────────────────
create table if not exists devices (
  id               text primary key,
  hospital_id      text not null references hospitals(id),
  patient_id       text not null references patients(id),
  patient_name     text,
  type             text not null,
  insertion_date   timestamptz,
  review_reminder  timestamptz,
  removal_date     timestamptz,
  status           text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Tasks ───────────────────────────────────────────────────
create table if not exists tasks (
  id            text primary key,
  hospital_id   text not null references hospitals(id),
  title         text not null,
  patient_id    text references patients(id),
  assigned_to   text,
  due_time      timestamptz,
  status        text default 'Pending',
  priority      text default 'Medium',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Notifications ───────────────────────────────────────────
create table if not exists notifications (
  id            text primary key,
  hospital_id   text not null references hospitals(id),
  title         text not null,
  detail        text,
  severity      text default 'info',
  time          timestamptz,
  acknowledged  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Timeline Events ─────────────────────────────────────────
create table if not exists timeline_events (
  id            text primary key,
  hospital_id   text not null references hospitals(id),
  patient_id    text not null references patients(id),
  type          text not null,
  title         text not null,
  time          timestamptz,
  note          text,
  created_at    timestamptz not null default now()
);

-- Reminder Rules ──────────────────────────────────────────
create table if not exists reminder_rules (
  id            text primary key,
  hospital_id   text not null references hospitals(id),
  name          text not null,
  value         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Daily Checklists ────────────────────────────────────────
create table if not exists daily_checklists (
  id                        text primary key default gen_random_uuid()::text,
  hospital_id               text not null references hospitals(id),
  patient_id                text not null references patients(id),
  ventilator_reviewed       boolean not null default false,
  nutrition                 boolean not null default false,
  dvt_prophylaxis           boolean not null default false,
  stress_ulcer_prophylaxis  boolean not null default false,
  sedation_reviewed         boolean not null default false,
  culture_reviewed          boolean not null default false,
  antibiotic_reviewed       boolean not null default false,
  device_necessity_reviewed boolean not null default false,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- Audit Logs ──────────────────────────────────────────────
create table if not exists audit_logs (
  id            text primary key default gen_random_uuid()::text,
  hospital_id   text not null references hospitals(id),
  action        text not null,
  entity_type   text not null,
  entity_id     text not null,
  performed_by  text,
  details       jsonb default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

-- Sessions ────────────────────────────────────────────────
create table if not exists sessions (
  id            text primary key default gen_random_uuid()::text,
  user_id       text not null references users(id),
  token         text not null,
  expires_at    timestamptz not null,
  created_at    timestamptz not null default now()
);

-- Role Assignments ────────────────────────────────────────
create table if not exists role_assignments (
  id            text primary key default gen_random_uuid()::text,
  hospital_id   text not null references hospitals(id),
  user_id       text not null references users(id),
  role          text not null,
  created_at    timestamptz not null default now()
);

-- ── 3. Indexes ──────────────────────────────────────────
create index if not exists idx_users_hospital on users(hospital_id);
create index if not exists idx_users_hospital_created on users(hospital_id, created_at desc);

create index if not exists idx_patients_hospital on patients(hospital_id);
create index if not exists idx_patients_hospital_created on patients(hospital_id, created_at desc);
create index if not exists idx_patients_status on patients(status);
create index if not exists idx_patients_priority on patients(priority);

create index if not exists idx_investigations_hospital on investigations(hospital_id);
create index if not exists idx_investigations_hospital_created on investigations(hospital_id, created_at desc);
create index if not exists idx_investigations_patient on investigations(patient_id);
create index if not exists idx_investigations_status on investigations(status);
create index if not exists idx_investigations_report_date on investigations(expected_report_date);

create index if not exists idx_antibiotics_hospital on antibiotics(hospital_id);
create index if not exists idx_antibiotics_hospital_created on antibiotics(hospital_id, created_at desc);
create index if not exists idx_antibiotics_patient on antibiotics(patient_id);
create index if not exists idx_antibiotics_review_date on antibiotics(review_date);

create index if not exists idx_devices_hospital on devices(hospital_id);
create index if not exists idx_devices_hospital_created on devices(hospital_id, created_at desc);
create index if not exists idx_devices_patient on devices(patient_id);

create index if not exists idx_tasks_hospital on tasks(hospital_id);
create index if not exists idx_tasks_hospital_created on tasks(hospital_id, created_at desc);
create index if not exists idx_tasks_status on tasks(status);
create index if not exists idx_tasks_due_time on tasks(due_time);

create index if not exists idx_notifications_hospital on notifications(hospital_id);
create index if not exists idx_notifications_hospital_created on notifications(hospital_id, created_at desc);
create index if not exists idx_notifications_ack on notifications(acknowledged);
create index if not exists idx_notifications_time on notifications(time desc);

create index if not exists idx_timeline_hospital on timeline_events(hospital_id);
create index if not exists idx_timeline_patient on timeline_events(patient_id);
create index if not exists idx_timeline_time on timeline_events(time desc);

create index if not exists idx_reminder_rules_hospital on reminder_rules(hospital_id);

create index if not exists idx_daily_checklists_hospital on daily_checklists(hospital_id);
create index if not exists idx_daily_checklists_patient on daily_checklists(patient_id);

create index if not exists idx_audit_logs_hospital on audit_logs(hospital_id);
create index if not exists idx_audit_logs_entity on audit_logs(entity_type, entity_id);

create index if not exists idx_sessions_user on sessions(user_id);
create index if not exists idx_sessions_token on sessions(token);

create index if not exists idx_role_assignments_hospital on role_assignments(hospital_id);
create index if not exists idx_role_assignments_user on role_assignments(user_id);

-- ── 4. Row Level Security ────────────────────────────────
alter table hospitals enable row level security;
alter table users enable row level security;
alter table patients enable row level security;
alter table investigations enable row level security;
alter table antibiotics enable row level security;
alter table devices enable row level security;
alter table tasks enable row level security;
alter table notifications enable row level security;
alter table timeline_events enable row level security;
alter table reminder_rules enable row level security;
alter table daily_checklists enable row level security;
alter table audit_logs enable row level security;
alter table sessions enable row level security;
alter table role_assignments enable row level security;

-- ═══════════════════════════════════════════════════════════
-- 4b. Migrations for existing tables
-- ═══════════════════════════════════════════════════════════

alter table users add column if not exists email text;
alter table users add column if not exists password_hash text;

update users set email='meera@stjohn.icu',   password_hash='240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9' where id='u-admin' and email is null;
update users set email='arjun@stjohn.icu',   password_hash='aba1dcd38408657aa7876b03edfb8fd74aab2b95e2eda5cf258202c7cd5ee64c' where id='u-consultant' and email is null;
update users set email='isha@stjohn.icu',    password_hash='2a2b8801afe2d9e5f47c5b786d8d349ce3d0b46f94c84bd5608abe1c2c75bb84' where id='u-resident' and email is null;
update users set email='drarushitest@gmail.com', password_hash='ebc548f3d08ce356cfd8d06bde1911661f27834f587164d183eb943bb615e35f' where id='u-arushi' and email is null;

-- ═══════════════════════════════════════════════════════════
-- 5. Seed Data
-- ═══════════════════════════════════════════════════════════

insert into hospitals (id, name, city, beds, plan, sync_status) values
  ('hosp-st-john', 'General Hospital', 'Bengaluru', 24, 'Pilot', 'Live'),
  ('hosp-aiims', 'AIIMS General', 'Delhi', 30, 'Pilot', 'Live')
on conflict (id) do nothing;

insert into users (id, hospital_id, name, email, password_hash, role, unit, status) values
  ('u-admin',       'hosp-st-john', 'Dr. Meera Rao',   'meera@stjohn.icu',  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Hospital Admin',  'ICU',          'Active'),
  ('u-consultant',  'hosp-st-john', 'Dr. Arjun Nair',  'arjun@stjohn.icu',  'aba1dcd38408657aa7876b03edfb8fd74aab2b95e2eda5cf258202c7cd5ee64c', 'ICU Consultant',  'Medical ICU',  'Active'),
  ('u-resident',    'hosp-st-john', 'Dr. Isha Khan',   'isha@stjohn.icu',  '2a2b8801afe2d9e5f47c5b786d8d349ce3d0b46f94c84bd5608abe1c2c75bb84', 'Senior Resident', 'Surgical ICU', 'Active'),
  ('u-arushi',      'hosp-aiims',   'Arushi',          'drarushitest@gmail.com', 'ebc548f3d08ce356cfd8d06bde1911661f27834f587164d183eb943bb615e35f', 'ICU Consultant',  'Medical ICU',  'Active')
on conflict (id) do nothing;

insert into patients (id, hospital_id, uhid, name, age, gender, bed, consultant, diagnosis,
                      admission_date, expected_discharge, status, priority, notes,
                      current_antibiotics, pending_investigations, completed_investigations, devices, daily_checklist)
values
  ('p-101', 'hosp-st-john', 'UHID-10421', 'Raghav Menon',  62, 'Male',   'ICU-03', 'Dr. Arjun Nair', 'Severe pneumonia with septic shock',
   '2026-06-24T07:20:00Z', '2026-07-01T00:00:00Z', 'Requires attention', 'High',
   'Improving pressor requirement. Culture pending review.',
   '["abx-1","abx-2"]'::jsonb, '["inv-1","inv-4"]'::jsonb, '["inv-2"]'::jsonb, '["dev-1","dev-2"]'::jsonb,
   '{"ventilatorReviewed":true,"nutrition":false,"dvtProphylaxis":true,"stressUlcerProphylaxis":true,"sedationReviewed":false,"cultureReviewed":false,"antibioticReviewed":false,"deviceNecessityReviewed":false}'::jsonb),
  ('p-102', 'hosp-st-john', 'UHID-10447', 'Ananya Shetty', 38, 'Female', 'ICU-09', 'Dr. Arjun Nair', 'DKA with aspiration risk',
   '2026-06-25T12:30:00Z', '2026-06-29T00:00:00Z', 'Stable', 'Medium',
   'Needs antibiotic review on day 3.',
   '["abx-3"]'::jsonb, '["inv-3"]'::jsonb, '["inv-5"]'::jsonb, '["dev-3"]'::jsonb,
   '{"ventilatorReviewed":false,"nutrition":true,"dvtProphylaxis":true,"stressUlcerProphylaxis":true,"sedationReviewed":true,"cultureReviewed":true,"antibioticReviewed":false,"deviceNecessityReviewed":true}'::jsonb),
  ('p-103', 'hosp-st-john', 'UHID-10489', 'Farhan Ali',    54, 'Male',   'ICU-14', 'Dr. Meera Rao',   'Post-op abdominal sepsis',
   '2026-06-23T04:10:00Z', '2026-06-30T00:00:00Z', 'Under review', 'High',
   'Needs line review and pending fungal report.',
   '["abx-4"]'::jsonb, '["inv-6"]'::jsonb, '["inv-7"]'::jsonb, '["dev-4"]'::jsonb,
   '{"ventilatorReviewed":true,"nutrition":true,"dvtProphylaxis":false,"stressUlcerProphylaxis":true,"sedationReviewed":true,"cultureReviewed":false,"antibioticReviewed":false,"deviceNecessityReviewed":false}'::jsonb)
on conflict (id) do nothing;

insert into investigations (id, hospital_id, patient_id, patient_name, name, lab_name, priority, status,
                            sent_date, expected_report_date, category, reminder_every_hours) values
  ('inv-1', 'hosp-st-john', 'p-101', 'Raghav Menon',  'Blood Culture',     'Central Microbiology',  'High',   'Pending',  '2026-06-24T08:00:00Z', '2026-06-26T08:00:00Z', 'Culture',   12),
  ('inv-2', 'hosp-st-john', 'p-101', 'Raghav Menon',  'Multiplex PCR',     'Reference Lab',         'Medium', 'Reviewed', '2026-06-24T09:30:00Z', '2026-06-25T09:30:00Z', 'Molecular', 24),
  ('inv-3', 'hosp-st-john', 'p-102', 'Ananya Shetty', 'Galactomannan Assay','Special Diagnostics',   'Medium', 'Received', '2026-06-25T13:05:00Z', '2026-06-26T13:05:00Z', 'Fungal',    12),
  ('inv-4', 'hosp-st-john', 'p-101', 'Raghav Menon',  'CSF PCR',           'Neuro Lab',             'Low',    'Pending',  '2026-06-25T15:20:00Z', '2026-06-27T15:20:00Z', 'PCR',       12),
  ('inv-5', 'hosp-st-john', 'p-102', 'Ananya Shetty', 'Blood Gas',         'ICU Point of Care',     'Low',    'Closed',   '2026-06-24T07:45:00Z', '2026-06-24T08:00:00Z', 'Bedside',    8),
  ('inv-6', 'hosp-st-john', 'p-103', 'Farhan Ali',     'Fungal Culture',    'Microbiology',          'High',   'Received', '2026-06-23T11:00:00Z', '2026-06-26T11:00:00Z', 'Culture',   12),
  ('inv-7', 'hosp-st-john', 'p-103', 'Farhan Ali',     'Autoimmune Panel',  'Reference Lab',         'Low',    'Reviewed', '2026-06-22T10:00:00Z', '2026-06-24T10:00:00Z', 'Panel',     24)
on conflict (id) do nothing;

insert into antibiotics (id, hospital_id, patient_id, patient_name, drug_name, dose, route, frequency,
                         start_date, indication, expected_duration, review_date, culture_linked, status, action, day) values
  ('abx-1', 'hosp-st-john', 'p-101', 'Raghav Menon',  'Meropenem',             '1 g',             'IV', '8 hourly',  '2026-06-24T07:40:00Z', 'Sepsis',              '5 days', '2026-06-28T07:40:00Z', 'inv-1', 'Review due', 'Continue',    5),
  ('abx-2', 'hosp-st-john', 'p-101', 'Raghav Menon',  'Vancomycin',            '750 mg',          'IV', '12 hourly', '2026-06-24T08:20:00Z', 'Empiric cover',       '3 days', '2026-06-26T08:20:00Z', 'inv-1', 'Review due', 'De-escalate', 3),
  ('abx-3', 'hosp-st-john', 'p-102', 'Ananya Shetty', 'Piperacillin Tazobactam','4.5 g',          'IV', '6 hourly',  '2026-06-25T12:50:00Z', 'Aspiration risk',     '4 days', '2026-06-29T12:50:00Z', 'inv-3', 'Active',     'Escalate',    2),
  ('abx-4', 'hosp-st-john', 'p-103', 'Farhan Ali',     'Polymyxin B',          '500,000 IU',      'IV', '12 hourly', '2026-06-23T05:00:00Z', 'Drug resistant sepsis','7 days', '2026-06-27T05:00:00Z', 'inv-6', 'High alert', 'Stop',        4)
on conflict (id) do nothing;

insert into devices (id, hospital_id, patient_id, patient_name, type, insertion_date, review_reminder, status) values
  ('dev-1', 'hosp-st-john', 'p-101', 'Raghav Menon',  'Central Line',      '2026-06-23T09:00:00Z', '2026-06-26T09:00:00Z', 'Day 4 review due'),
  ('dev-2', 'hosp-st-john', 'p-101', 'Raghav Menon',  'ET Tube',           '2026-06-24T07:25:00Z', '2026-06-26T07:25:00Z', 'Ventilator review'),
  ('dev-3', 'hosp-st-john', 'p-102', 'Ananya Shetty', 'Foley',             '2026-06-25T12:40:00Z', '2026-06-27T12:40:00Z', 'Day 2 review'),
  ('dev-4', 'hosp-st-john', 'p-103', 'Farhan Ali',     'Dialysis Catheter', '2026-06-23T04:30:00Z', '2026-06-26T04:30:00Z', 'Day 4 review due')
on conflict (id) do nothing;

insert into tasks (id, hospital_id, title, patient_id, assigned_to, due_time, status, priority) values
  ('task-1', 'hosp-st-john', 'Review Blood Culture', 'p-101', 'Dr. Isha Khan',  '2026-06-26T14:00:00Z', 'Pending',   'High'),
  ('task-2', 'hosp-st-john', 'Repeat CBC',           'p-102', 'Dr. Arjun Nair', '2026-06-26T16:30:00Z', 'Pending',   'Medium'),
  ('task-3', 'hosp-st-john', 'Remove Catheter',      'p-103', 'Dr. Meera Rao',  '2026-06-26T18:00:00Z', 'Completed', 'High')
on conflict (id) do nothing;

insert into notifications (id, hospital_id, title, detail, severity, time, acknowledged) values
  ('n-1', 'hosp-st-john', 'Culture pending for 48 hours', 'Blood Culture for Raghav Menon has exceeded reminder threshold.', 'critical', '2026-06-26T07:30:00Z', false),
  ('n-2', 'hosp-st-john', 'Review Vancomycin',            'Day 3 review due on ICU-03. Linked culture now received.',         'warning',  '2026-06-26T09:10:00Z', false),
  ('n-3', 'hosp-st-john', 'Device Day 7',                 'Central line review window triggered for ICU-14.',                 'info',     '2026-06-26T10:40:00Z', true),
  ('n-4', 'hosp-st-john', 'Culture report received',      'Galactomannan assay is ready for review in ICU-09.',               'safe',     '2026-06-26T11:05:00Z', false)
on conflict (id) do nothing;

insert into timeline_events (id, hospital_id, patient_id, type, title, time, note) values
  ('t-1', 'hosp-st-john', 'p-101', 'Admission',            'Admitted to ICU-03',      '2026-06-24T07:20:00Z', 'Severe pneumonia with septic shock.'),
  ('t-2', 'hosp-st-john', 'p-101', 'Investigation Sent',   'Blood Culture sent',      '2026-06-24T08:00:00Z', 'Central microbiology notified.'),
  ('t-3', 'hosp-st-john', 'p-101', 'Antibiotic Started',   'Meropenem started',       '2026-06-24T07:40:00Z', 'Review expected day 5.'),
  ('t-4', 'hosp-st-john', 'p-101', 'Note',                 'Pressor dose improving',  '2026-06-25T13:10:00Z', 'Reassess overnight cultures.'),
  ('t-5', 'hosp-st-john', 'p-101', 'Device Inserted',      'Central line inserted',   '2026-06-23T09:00:00Z', 'Review necessity every day.')
on conflict (id) do nothing;

insert into daily_checklists (hospital_id, patient_id, ventilator_reviewed, nutrition, dvt_prophylaxis,
                              stress_ulcer_prophylaxis, sedation_reviewed, culture_reviewed,
                              antibiotic_reviewed, device_necessity_reviewed) values
  ('hosp-st-john', 'p-101', true,  false, true,  true, false, false, false, false),
  ('hosp-st-john', 'p-102', false, true,  true,  true, true,  true,  false, true),
  ('hosp-st-john', 'p-103', true,  true,  false, true, true,  false, false, false)
on conflict (id) do nothing;

insert into reminder_rules (id, hospital_id, name, value) values
  ('r-1', 'hosp-st-john', 'Default antibiotic review', '48 hours'),
  ('r-2', 'hosp-st-john', 'Culture pending reminder',  '12 hours'),
  ('r-3', 'hosp-st-john', 'Device review reminder',    '24 hours')
on conflict (id) do nothing;
