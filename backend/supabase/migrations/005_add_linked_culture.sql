-- Add linked_culture column to antibiotics table
ALTER TABLE antibiotics ADD COLUMN IF NOT EXISTS linked_culture TEXT;
