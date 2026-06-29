-- 004 — Add audit fields for clinical actions
-- Run this after 003_add_cascade_delete.sql in Supabase SQL Editor.

alter table antibiotics
  add column if not exists stopped_at    timestamptz,
  add column if not exists stopped_by    text,
  add column if not exists stop_reason   text;

alter table antibiotics
  add column if not exists review_due_date timestamptz;

alter table devices
  add column if not exists removed_by text;

alter table investigations
  add column if not exists completed_at timestamptz,
  add column if not exists completed_by text;
