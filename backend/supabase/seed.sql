-- ICU Steward 2.0 — Seed Data
-- Run this after 00001_create_tables.sql to populate development fixtures.

-- ── Hospital ──────────────────────────────────────────────
insert into hospitals (id, name, city, beds, plan, sync_status) values
  ('hosp-st-john', 'St. John ICU', 'Bengaluru', 24, 'Pilot', 'Live'),
  ('hosp-green-valley', 'Green Valley ICU', 'Mumbai', 18, 'Enterprise', 'Live')
on conflict (id) do nothing;

-- ── Users ─────────────────────────────────────────────────
insert into users (id, hospital_id, name, role, unit, status) values
  ('u-admin',       'hosp-st-john', 'Dr. Meera Rao',    'Hospital Admin',  'ICU',          'Active'),
  ('u-consultant',  'hosp-st-john', 'Dr. Arjun Nair',   'ICU Consultant',  'Medical ICU',  'Active'),
  ('u-resident',    'hosp-st-john', 'Dr. Isha Khan',    'Senior Resident', 'Surgical ICU', 'Active')
on conflict (id) do nothing;

-- ── Patients ──────────────────────────────────────────────
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

-- ── Investigations ────────────────────────────────────────
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

-- ── Antibiotics ───────────────────────────────────────────
insert into antibiotics (id, hospital_id, patient_id, patient_name, drug_name, dose, route, frequency,
                         start_date, indication, expected_duration, review_date, culture_linked, status, action, day) values
  ('abx-1', 'hosp-st-john', 'p-101', 'Raghav Menon',  'Meropenem',             '1 g',             'IV', '8 hourly',  '2026-06-24T07:40:00Z', 'Sepsis',              '5 days', '2026-06-28T07:40:00Z', 'inv-1', 'Review due', 'Continue',    5),
  ('abx-2', 'hosp-st-john', 'p-101', 'Raghav Menon',  'Vancomycin',            '750 mg',          'IV', '12 hourly', '2026-06-24T08:20:00Z', 'Empiric cover',       '3 days', '2026-06-26T08:20:00Z', 'inv-1', 'Review due', 'De-escalate', 3),
  ('abx-3', 'hosp-st-john', 'p-102', 'Ananya Shetty', 'Piperacillin Tazobactam','4.5 g',          'IV', '6 hourly',  '2026-06-25T12:50:00Z', 'Aspiration risk',     '4 days', '2026-06-29T12:50:00Z', 'inv-3', 'Active',     'Escalate',    2),
  ('abx-4', 'hosp-st-john', 'p-103', 'Farhan Ali',     'Polymyxin B',          '500,000 IU',      'IV', '12 hourly', '2026-06-23T05:00:00Z', 'Drug resistant sepsis','7 days', '2026-06-27T05:00:00Z', 'inv-6', 'High alert', 'Stop',        4)
on conflict (id) do nothing;

-- ── Devices ───────────────────────────────────────────────
insert into devices (id, hospital_id, patient_id, patient_name, type, insertion_date, review_reminder, status) values
  ('dev-1', 'hosp-st-john', 'p-101', 'Raghav Menon',  'Central Line',      '2026-06-23T09:00:00Z', '2026-06-26T09:00:00Z', 'Day 4 review due'),
  ('dev-2', 'hosp-st-john', 'p-101', 'Raghav Menon',  'ET Tube',           '2026-06-24T07:25:00Z', '2026-06-26T07:25:00Z', 'Ventilator review'),
  ('dev-3', 'hosp-st-john', 'p-102', 'Ananya Shetty', 'Foley',             '2026-06-25T12:40:00Z', '2026-06-27T12:40:00Z', 'Day 2 review'),
  ('dev-4', 'hosp-st-john', 'p-103', 'Farhan Ali',     'Dialysis Catheter', '2026-06-23T04:30:00Z', '2026-06-26T04:30:00Z', 'Day 4 review due')
on conflict (id) do nothing;

-- ── Tasks ─────────────────────────────────────────────────
insert into tasks (id, hospital_id, title, patient_id, assigned_to, due_time, status, priority) values
  ('task-1', 'hosp-st-john', 'Review Blood Culture', 'p-101', 'Dr. Isha Khan',  '2026-06-26T14:00:00Z', 'Pending',   'High'),
  ('task-2', 'hosp-st-john', 'Repeat CBC',           'p-102', 'Dr. Arjun Nair', '2026-06-26T16:30:00Z', 'Pending',   'Medium'),
  ('task-3', 'hosp-st-john', 'Remove Catheter',      'p-103', 'Dr. Meera Rao',  '2026-06-26T18:00:00Z', 'Completed', 'High')
on conflict (id) do nothing;

-- ── Notifications ─────────────────────────────────────────
insert into notifications (id, hospital_id, title, detail, severity, time, acknowledged) values
  ('n-1', 'hosp-st-john', 'Culture pending for 48 hours', 'Blood Culture for Raghav Menon has exceeded reminder threshold.', 'critical', '2026-06-26T07:30:00Z', false),
  ('n-2', 'hosp-st-john', 'Review Vancomycin',            'Day 3 review due on ICU-03. Linked culture now received.',         'warning',  '2026-06-26T09:10:00Z', false),
  ('n-3', 'hosp-st-john', 'Device Day 7',                 'Central line review window triggered for ICU-14.',                 'info',     '2026-06-26T10:40:00Z', true),
  ('n-4', 'hosp-st-john', 'Culture report received',      'Galactomannan assay is ready for review in ICU-09.',               'safe',     '2026-06-26T11:05:00Z', false)
on conflict (id) do nothing;

-- ── Timeline Events ───────────────────────────────────────
insert into timeline_events (id, hospital_id, patient_id, type, title, time, note) values
  ('t-1', 'hosp-st-john', 'p-101', 'Admission',            'Admitted to ICU-03',      '2026-06-24T07:20:00Z', 'Severe pneumonia with septic shock.'),
  ('t-2', 'hosp-st-john', 'p-101', 'Investigation Sent',   'Blood Culture sent',      '2026-06-24T08:00:00Z', 'Central microbiology notified.'),
  ('t-3', 'hosp-st-john', 'p-101', 'Antibiotic Started',   'Meropenem started',       '2026-06-24T07:40:00Z', 'Review expected day 5.'),
  ('t-4', 'hosp-st-john', 'p-101', 'Note',                 'Pressor dose improving',  '2026-06-25T13:10:00Z', 'Reassess overnight cultures.'),
  ('t-5', 'hosp-st-john', 'p-101', 'Device Inserted',      'Central line inserted',   '2026-06-23T09:00:00Z', 'Review necessity every day.')
on conflict (id) do nothing;

-- ── Daily Checklists ──────────────────────────────────────
insert into daily_checklists (hospital_id, patient_id, ventilator_reviewed, nutrition, dvt_prophylaxis,
                              stress_ulcer_prophylaxis, sedation_reviewed, culture_reviewed,
                              antibiotic_reviewed, device_necessity_reviewed) values
  ('hosp-st-john', 'p-101', true,  false, true,  true, false, false, false, false),
  ('hosp-st-john', 'p-102', false, true,  true,  true, true,  true,  false, true),
  ('hosp-st-john', 'p-103', true,  true,  false, true, true,  false, false, false)
on conflict (id) do nothing;

-- ── Reminder Rules ────────────────────────────────────────
insert into reminder_rules (id, hospital_id, name, value) values
  ('r-1', 'hosp-st-john', 'Default antibiotic review', '48 hours'),
  ('r-2', 'hosp-st-john', 'Culture pending reminder',  '12 hours'),
  ('r-3', 'hosp-st-john', 'Device review reminder',    '24 hours')
on conflict (id) do nothing;
