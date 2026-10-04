-- ============================================================
-- 004 — Mark English Language as non-MCQ
-- Run in Supabase SQL Editor AFTER 003_subject_catalogue.sql
--
-- Product decision: Mathematics and English Language both have no
-- drillable MCQ Paper I, so they are excluded from practice mode.
--
-- Both subjects are RETAINED in the catalogue. They still appear on a
-- student's subject list (every candidate takes them), but the app greys
-- them out with an "MCQ පත්‍රයක් නොමැත / No MCQ paper" badge rather than
-- hiding them.
--
-- To reverse either decision, set is_mcq = TRUE for that subject.
-- No schema change is required.
-- ============================================================

UPDATE subjects
SET is_mcq = FALSE, updated_at = NOW()
WHERE name_en IN ('English Language', 'Mathematics');

-- English's seeded topics (Grammar, Vocabulary, Comprehension) are left in
-- place: they are inert while the subject is non-MCQ, and restoring
-- is_mcq = TRUE makes them live again without re-seeding.