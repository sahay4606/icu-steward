-- ICU Steward 2.0 — Schema
-- Run this in Supabase SQL Editor to create all tables.
--
-- Conventions:
--   - id (text PK) — app-level keys match mock data
--   - hospital_id — every tenant-scoped table carries this
--   - created_at / updated_at — every table has both

-- ── Extension ──────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Hospitals ─────────────────────────────────────────────
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

-- ── Users ─────────────────────────────────────────────────
create table if not exists users (
  id            text primary key,
  hospital_id   text not null references hospitals(id),
  name          text not null,
  role          text not null,
  unit          text,
  status        text default 'Active',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_users_hospital on users(hospital_id);
create index if not exists idx_users_hospital_created on users(hospital_id, created_at desc);

-- ── Patients ──────────────────────────────────────────────
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
create index if not exists idx_patients_hospital on patients(hospital_id);
create index if not exists idx_patients_hospital_created on patients(hospital_id, created_at desc);
create index if not exists idx_patients_status on patients(status);
create index if not exists idx_patients_priority on patients(priority);

-- ── Investigations ────────────────────────────────────────
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
create index if not exists idx_investigations_hospital on investigations(hospital_id);
create index if not exists idx_investigations_hospital_created on investigations(hospital_id, created_at desc);
create index if not exists idx_investigations_patient on investigations(patient_id);
create index if not exists idx_investigations_status on investigations(status);
create index if not exists idx_investigations_report_date on investigations(expected_report_date);

-- ── Antibiotics ───────────────────────────────────────────
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
create index if not exists idx_antibiotics_hospital on antibiotics(hospital_id);
create index if not exists idx_antibiotics_hospital_created on antibiotics(hospital_id, created_at desc);
create index if not exists idx_antibiotics_patient on antibiotics(patient_id);
create index if not exists idx_antibiotics_review_date on antibiotics(review_date);

-- ── Devices ───────────────────────────────────────────────
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
create index if not exists idx_devices_hospital on devices(hospital_id);
create index if not exists idx_devices_hospital_created on devices(hospital_id, created_at desc);
create index if not exists idx_devices_patient on devices(patient_id);

-- ── Tasks ─────────────────────────────────────────────────
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
create index if not exists idx_tasks_hospital on tasks(hospital_id);
create index if not exists idx_tasks_hospital_created on tasks(hospital_id, created_at desc);
create index if not exists idx_tasks_status on tasks(status);
create index if not exists idx_tasks_due_time on tasks(due_time);

-- ── Notifications ─────────────────────────────────────────
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
create index if not exists idx_notifications_hospital on notifications(hospital_id);
create index if not exists idx_notifications_hospital_created on notifications(hospital_id, created_at desc);
create index if not exists idx_notifications_ack on notifications(acknowledged);
create index if not exists idx_notifications_time on notifications(time desc);

-- ── Timeline Events ───────────────────────────────────────
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
create index if not exists idx_timeline_hospital on timeline_events(hospital_id);
create index if not exists idx_timeline_patient on timeline_events(patient_id);
create index if not exists idx_timeline_time on timeline_events(time desc);

-- ── Reminder Rules ────────────────────────────────────────
create table if not exists reminder_rules (
  id            text primary key,
  hospital_id   text not null references hospitals(id),
  name          text not null,
  value         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_reminder_rules_hospital on reminder_rules(hospital_id);

-- ── Daily Checklists ──────────────────────────────────────
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
create index if not exists idx_daily_checklists_hospital on daily_checklists(hospital_id);
create index if not exists idx_daily_checklists_patient on daily_checklists(patient_id);

-- ── Audit Logs ────────────────────────────────────────────
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
create index if not exists idx_audit_logs_hospital on audit_logs(hospital_id);
create index if not exists idx_audit_logs_entity on audit_logs(entity_type, entity_id);

-- ── Sessions ──────────────────────────────────────────────
create table if not exists sessions (
  id            text primary key default gen_random_uuid()::text,
  user_id       text not null references users(id),
  token         text not null,
  expires_at    timestamptz not null,
  created_at    timestamptz not null default now()
);
create index if not exists idx_sessions_user on sessions(user_id);
create index if not exists idx_sessions_token on sessions(token);

-- ── Role Assignments ──────────────────────────────────────
create table if not exists role_assignments (
  id            text primary key default gen_random_uuid()::text,
  hospital_id   text not null references hospitals(id),
  user_id       text not null references users(id),
  role          text not null,
  created_at    timestamptz not null default now()
);
create index if not exists idx_role_assignments_hospital on role_assignments(hospital_id);
create index if not exists idx_role_assignments_user on role_assignments(user_id);

-- ── Enable RLS on all tables ──────────────────────────────
-- (Policies to be defined per-role once auth is wired)
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
