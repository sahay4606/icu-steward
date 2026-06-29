-- ══════════════════════════════════════════════════════════════════════════════
-- Migration 013: Add beds config, reminder columns, and timeline enrichment
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. Hospitals: configurable ICU bed count ──
ALTER TABLE hospitals
  ADD COLUMN IF NOT EXISTS icu_beds INTEGER DEFAULT 30;

-- Back-fill existing rows
UPDATE hospitals SET icu_beds = COALESCE(beds, 30) WHERE icu_beds IS NULL;

-- ── 2. Investigations: reminder + culture link columns ──
ALTER TABLE investigations
  ADD COLUMN IF NOT EXISTS reminder_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS custom_alert_message TEXT,
  ADD COLUMN IF NOT EXISTS linked_culture       TEXT;

-- ── 3. Devices: reminder + culture link columns ──
ALTER TABLE devices
  ADD COLUMN IF NOT EXISTS reminder_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS custom_alert_message TEXT,
  ADD COLUMN IF NOT EXISTS linked_culture       TEXT;

-- ── 4. Antibiotics: custom alert message (frequency cols added in 012) ──
ALTER TABLE antibiotics
  ADD COLUMN IF NOT EXISTS custom_alert_message TEXT;

-- ── 5. Timeline events enrichment for global activity feed ──
ALTER TABLE timeline_events
  ADD COLUMN IF NOT EXISTS performed_by_name TEXT,
  ADD COLUMN IF NOT EXISTS old_value         TEXT,
  ADD COLUMN IF NOT EXISTS new_value         TEXT,
  ADD COLUMN IF NOT EXISTS description       TEXT;

-- ── 6. Notifications: patient_id column if missing ──
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS patient_id TEXT REFERENCES patients(id);
