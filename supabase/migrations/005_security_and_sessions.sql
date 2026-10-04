-- ============================================================
-- 005 — Roles, admin-managed subject expectations, practice sessions
-- Run in Supabase SQL Editor AFTER 004_mark_english_non_mcq.sql
--
-- Three concerns:
--   1. Roles, so content writes can be gated to admins.
--   2. expected_mcq_count, because MCQ counts differ per subject
--      (most are 40, some are 30/50, some have no MCQ paper at all).
--   3. Practice sessions, so grading happens server-side and a student
--      controls timing, skipping and when to stop.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Roles
-- ------------------------------------------------------------
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_role_check CHECK (role IN ('student', 'admin'));
  END IF;
END $$;

-- Promote the first admin by hand:
--   UPDATE users SET role = 'admin' WHERE email = 'you@example.com';

-- ------------------------------------------------------------
-- 2. Admin-managed expectation per subject
-- ------------------------------------------------------------
-- NULL means "no MCQ paper" and is equivalent to is_mcq = false.
-- Kept separate from is_mcq so an admin can say "this subject should
-- eventually hold 40 questions" without the app pretending it can
-- be practised today.
ALTER TABLE subjects
  ADD COLUMN IF NOT EXISTS expected_mcq_count INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subjects_expected_mcq_count_check'
  ) THEN
    ALTER TABLE subjects
      ADD CONSTRAINT subjects_expected_mcq_count_check
      CHECK (expected_mcq_count IS NULL OR expected_mcq_count > 0);
  END IF;
END $$;

-- Seed a sensible default: 40 for every MCQ subject, NULL otherwise.
UPDATE subjects
SET expected_mcq_count = 40
WHERE is_mcq = TRUE AND expected_mcq_count IS NULL;

-- ------------------------------------------------------------
-- 3. Practice sessions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS practice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,

  -- 'timed'     student chose to run the clock
  -- 'untimed'   practice at their own pace
  mode TEXT NOT NULL DEFAULT 'untimed',

  -- 'active' | 'completed' | 'abandoned'
  status TEXT NOT NULL DEFAULT 'active',

  -- Question ids are frozen at creation so a session stays coherent even
  -- if the admin edits the bank mid-attempt.
  question_ids UUID[] NOT NULL DEFAULT '{}',

  total_questions INTEGER NOT NULL DEFAULT 0,
  answered_count INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  elapsed_seconds INTEGER NOT NULL DEFAULT 0,

  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT practice_sessions_mode_check CHECK (mode IN ('timed', 'untimed')),
  CONSTRAINT practice_sessions_status_check
    CHECK (status IN ('active', 'completed', 'abandoned'))
);

-- One live session per student: keeps marks unambiguous and stops a student
-- from running many in parallel to farm attempt counts. A partial index, so
-- completed and abandoned sessions stay unconstrained.
CREATE UNIQUE INDEX IF NOT EXISTS idx_practice_sessions_one_active
  ON practice_sessions(user_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id
  ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_started_at
  ON practice_sessions(started_at DESC);

-- ------------------------------------------------------------
-- Answers
-- ------------------------------------------------------------
-- selected_answer is nullable so a skipped question is recorded as
-- visited without being answered. UNIQUE lets a student revisit and
-- change an answer without duplicating the row.
CREATE TABLE IF NOT EXISTS practice_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_answer INTEGER,
  is_correct BOOLEAN,
  time_taken INTEGER,
  answered_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT practice_answers_unique_per_question UNIQUE (session_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_practice_answers_session_id
  ON practice_answers(session_id);