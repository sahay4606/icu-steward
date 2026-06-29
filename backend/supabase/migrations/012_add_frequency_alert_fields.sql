alter table antibiotics
  add column if not exists frequency_hours   integer,
  add column if not exists frequency_minutes integer,
  add column if not exists custom_alert_at   timestamptz;
