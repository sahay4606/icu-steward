-- Migration 003: Add ON DELETE CASCADE to all patient foreign keys
-- This allows deleting a patient without manually removing child records first.
-- Run in Supabase SQL Editor.

-- Drop existing FK constraints and recreate with CASCADE
-- investigations
alter table investigations drop constraint investigations_patient_id_fkey;
alter table investigations add constraint investigations_patient_id_fkey
  foreign key (patient_id) references patients(id) on delete cascade;

-- antibiotics
alter table antibiotics drop constraint antibiotics_patient_id_fkey;
alter table antibiotics add constraint antibiotics_patient_id_fkey
  foreign key (patient_id) references patients(id) on delete cascade;

-- devices
alter table devices drop constraint devices_patient_id_fkey;
alter table devices add constraint devices_patient_id_fkey
  foreign key (patient_id) references patients(id) on delete cascade;

-- tasks
alter table tasks drop constraint tasks_patient_id_fkey;
alter table tasks add constraint tasks_patient_id_fkey
  foreign key (patient_id) references patients(id) on delete cascade;

-- timeline_events
alter table timeline_events drop constraint timeline_events_patient_id_fkey;
alter table timeline_events add constraint timeline_events_patient_id_fkey
  foreign key (patient_id) references patients(id) on delete cascade;

-- daily_checklists
alter table daily_checklists drop constraint daily_checklists_patient_id_fkey;
alter table daily_checklists add constraint daily_checklists_patient_id_fkey
  foreign key (patient_id) references patients(id) on delete cascade;
