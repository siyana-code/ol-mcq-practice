-- ============================================================
-- 002 — Accounts, profiles and optional subject baskets
-- Run in Supabase SQL Editor AFTER 001_initial_schema.sql
-- ============================================================

-- ------------------------------------------------------------
-- Subjects: which exam slot a subject belongs to, and whether
-- it actually has an MCQ Paper I we can drill.
-- ------------------------------------------------------------
ALTER TABLE subjects
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'mandatory',
  ADD COLUMN IF NOT EXISTS is_mcq BOOLEAN NOT NULL DEFAULT TRUE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subjects_category_check'
  ) THEN
    ALTER TABLE subjects
      ADD CONSTRAINT subjects_category_check
      CHECK (category IN ('mandatory', 'basket1', 'basket2', 'basket3'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_subjects_category ON subjects(category);

-- ------------------------------------------------------------
-- Users: exam identity (mother language + religion) and
-- onboarding completion flag.
-- ------------------------------------------------------------
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS mother_language TEXT,
  ADD COLUMN IF NOT EXISTS religion TEXT,
  ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_mother_language_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_mother_language_check
      CHECK (mother_language IN ('sinhala', 'tamil'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_religion_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_religion_check
      CHECK (religion IN ('buddhism', 'christianity', 'islam', 'shaivism'));
  END IF;
END $$;

-- ------------------------------------------------------------
-- A candidate's optional picks: exactly one subject per basket.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  basket INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT user_subjects_unique_per_subject UNIQUE (user_id, subject_id)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_subjects_basket_check'
  ) THEN
    ALTER TABLE user_subjects
      ADD CONSTRAINT user_subjects_basket_check
      CHECK (basket IN (1, 2, 3));
  END IF;
END $$;

-- One subject per basket per user.
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subjects_one_per_basket
  ON user_subjects (user_id, basket);

CREATE INDEX IF NOT EXISTS idx_user_subjects_user_id ON user_subjects(user_id);