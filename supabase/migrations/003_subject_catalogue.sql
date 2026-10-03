-- ============================================================
-- 003 — Full Sri Lankan O/L subject catalogue
-- Run in Supabase SQL Editor AFTER 002_accounts_and_baskets.sql
--
-- Structure: 6 mandatory + 3 optional baskets (1 pick each).
--
-- is_mcq = false means the subject has no drillable MCQ Paper I,
-- either because it is practical/performance assessed (Basket 2)
-- or because it is essay-based.
--
-- NOTE: Mathematics is deliberately retained but flagged is_mcq=false
-- per product decision. Flip to TRUE if a paper check confirms
-- Maths Paper I carries MCQs.
-- ============================================================

TRUNCATE TABLE
  user_subjects,
  user_progress,
  questions,
  topics,
  past_papers,
  subjects
CASCADE;

-- ------------------------------------------------------------
-- Mandatory — taken by every candidate
-- ------------------------------------------------------------
INSERT INTO subjects (name_si, name_en, icon, sort_order, category, is_mcq) VALUES
  ('සිංහල භාෂාව',        'Sinhala Language',        'text',     1, 'mandatory', TRUE),
  ('ඉංග්‍රීසි භාෂාව',       'English Language',        'language', 2, 'mandatory', TRUE),
  ('විද්‍යාව',              'Science',                  'flask',    3, 'mandatory', TRUE),
  ('ඉතිහාසය',             'History',                  'time',     4, 'mandatory', TRUE),
  ('ධර්මය',               'Religion',                 'flower',   5, 'mandatory', TRUE),
  ('ගණිතය',              'Mathematics',              'calculator', 6, 'mandatory', FALSE);

-- ------------------------------------------------------------
-- Basket 1
-- ------------------------------------------------------------
INSERT INTO subjects (name_si, name_en, icon, sort_order, category, is_mcq) VALUES
  ('ව්‍යාපෘති හා ගණකිරිම් අධ්‍යාපනය', 'Business & Accounting Studies', 'briefcase', 1, 'basket1', TRUE),
  ('ජීමවාසය',           'Geography',                    'earth',     2, 'basket1', TRUE),
  ('සමාජ අධ්‍යාපනය',      'Civic Education',              'people',    3, 'basket1', TRUE),
  ('නවෝප්තුකාරිත්වය',     'Entrepreneurship Studies',     'rocket',    4, 'basket1', TRUE),
  ('දෙවන භාෂාව — සිංහල',  'Second Language — Sinhala',    'language',  5, 'basket1', TRUE),
  ('දෙවන භාෂාව — දෙමළය', 'Second Language — Tamil',      'language',  6, 'basket1', TRUE),
  ('පාලි භාෂාව',           'Pali',                         'language',  7, 'basket1', TRUE),
  ('සංස්කෘත භාෂාව',       'Sanskrit',                     'language',  8, 'basket1', TRUE),
  ('ප්‍රංඡික භාෂාව',        'French',                       'language',  9, 'basket1', TRUE),
  ('ජර්මාන භාෂාව',       'German',                       'language', 10, 'basket1', TRUE),
  ('හින්දි භාෂාව',        'Hindi',                        'language', 11, 'basket1', TRUE),
  ('ජපානි භාෂාව',        'Japanese',                     'language', 12, 'basket1', TRUE),
  ('අරාබි භාෂාව',         'Arabic',                       'language', 13, 'basket1', TRUE);

-- ------------------------------------------------------------
-- Basket 2 — practical / performance assessed, not MCQ
-- ------------------------------------------------------------
INSERT INTO subjects (name_si, name_en, icon, sort_order, category, is_mcq) VALUES
  ('නැගුගා සංගීතය',    'Eastern Music',          'musical-notes',   1, 'basket2', FALSE),
  ('පාර්ථගාතීය සංගීතය', 'Western Music',          'musical-notes',   2, 'basket2', FALSE),
  ('කර්නාටක සංගීතය',   'Carnatic Music',         'musical-notes',   3, 'basket2', FALSE),
  ('නැගුගා නර්තනය',     'Eastern Dancing',        'body',            4, 'basket2', FALSE),
  ('භාරත නර්තනය',      'Bharatha Dancing',       'body',            5, 'basket2', FALSE),
  ('චිත්‍ර ශිල්පය',      'Art',                    'color-palette',   6, 'basket2', FALSE),
  ('නාට්‍ය හා රංගනය',     'Drama and Theatre',      'film',            7, 'basket2', FALSE),
  ('ඉංග්‍රීසි ගදන අධ්‍යාපනය', 'Appreciation of English Literary Texts', 'book', 8, 'basket2', FALSE),
  ('සිංහල ගදන අධ්‍යාපනය',  'Appreciation of Sinhala Literary Texts', 'book', 9, 'basket2', FALSE),
  ('දෙමළ ගදන අධ්‍යාපනය',  'Appreciation of Tamil Literary Texts',   'book', 10, 'basket2', FALSE),
  ('අරාබි ගදන අධ්‍යාපනය',  'Appreciation of Arabic Literary Texts',  'book', 11, 'basket2', FALSE);

-- ------------------------------------------------------------
-- Basket 3
-- ------------------------------------------------------------
INSERT INTO subjects (name_si, name_en, icon, sort_order, category, is_mcq) VALUES
  ('තොරතුරු තත්තු ක්‍රමය', 'Information & Communication Technology', 'desktop', 1, 'basket3', TRUE),
  ('ගොවිත්‍රීම හා ආහාර තත්තුක්‍රමය', 'Agriculture & Food Technology', 'leaf', 2, 'basket3', TRUE),
  ('ජලජ වයර තත්තුක්‍රමය', 'Aquatic Bio Resources Technology', 'fish', 3, 'basket3', TRUE),
  ('කලාව හා අත්කරණය',  'Arts & Crafts',                  'hammer',   4, 'basket3', TRUE),
  ('ගෘහ අධ්‍යාපනය',     'Home Economics',               'home',     5, 'basket3', TRUE),
  ('සෞඛ්‍ය හා චාලකාලික අධ්‍යාපනය', 'Health & Physical Education', 'fitness', 6, 'basket3', TRUE),
  ('සන්දේශ හා මාධ්‍ය අධ්‍යාපනය', 'Communication & Media Studies', 'videocam', 7, 'basket3', TRUE),
  ('සැකසුම් හා ගොඩනැගිලි තත්තුක්‍රමය', 'Design & Construction Technology', 'construct', 8, 'basket3', TRUE),
  ('සැකසුම් හා යාබ්‍ය තත්තුක්‍රමය', 'Design & Mechanical Technology', 'build', 9, 'basket3', TRUE),
  ('සැකසුම්, ඉලෙක්ට්‍රෝනික හා ඉලෙක්ට්‍රනික තත්තුක්‍රමය', 'Design, Electrical & Electronic Technology', 'flash', 10, 'basket3', TRUE),
  ('ඉලෙක්ට්‍රෝනික ලේඛන හා අනුර්ත ලියුපිය', 'Electronic Writing & Shorthand', 'keypad', 11, 'basket3', TRUE);

-- ------------------------------------------------------------
-- Default topics for MCQ subjects we intend to populate first
-- ------------------------------------------------------------
INSERT INTO topics (subject_id, name_si, name_en, sort_order)
SELECT s.id, t.name_si, t.name_en, t.sort_order
FROM subjects s
JOIN (VALUES
  -- Science
  ('Science',     'රසායන විද්‍යාව',   'Chemistry',        1),
  ('Science',     'භෞතික විද්‍යාව',   'Physics',          2),
  ('Science',     'ජීව විද්‍යාව',      'Biology',          3),
  -- English
  ('English Language', 'ව්‍යාකරණය',  'Grammar',           1),
  ('English Language', 'වචන මාලාව', 'Vocabulary',        2),
  ('English Language', 'පාර්සය',    'Comprehension',     3),
  -- History
  ('History',     'පෙර ඉතිහාසය',   'Ancient History',   1),
  ('History',     'මධ්‍ය ඉතිහාසය',   'Medieval History',  2),
  ('History',     'නවීන ඉතිහාසය',  'Modern History',    3),
  -- Sinhala
  ('Sinhala Language', 'ව්‍යාකරණය', 'Grammar',          1),
  ('Sinhala Language', 'වචන මාලාව', 'Vocabulary',       2),
  -- Religion
  ('Religion',    'බුද්ධ ධර්මය',   'Buddhism',         1),
  ('Religion',    'සිල්ල ධර්මය',   'Hinduism',         2),
  ('Religion',    'ක්‍රිස්තු ධර්මය',  'Christianity',     3),
  ('Religion',    'ඉස්ලාම් ධර්මය',  'Islam',            4),
  -- Basket 1 / 3
  ('Information & Communication Technology', 'පරිපථ සහගත', 'Networks',   1),
  ('Information & Communication Technology', 'දත්ත ගබඩා',  'Databases', 2),
  ('Information & Communication Technology', 'වැඩසැලි',    'Web',       3),
  ('Business & Accounting Studies', 'ගණකිරිම',        'Accounting', 1),
  ('Business & Accounting Studies', 'ව්‍යාපාරය',    'Business',   2),
  ('Geography',   'භූමික විද්‍යාව', 'Physical Geography', 1),
  ('Geography',   'මිනිම ජීමවාසය', 'Human Geography',  2)
) AS t(subject_name, name_si, name_en, sort_order)
  ON s.name_en = t.subject_name
WHERE s.is_mcq = TRUE;