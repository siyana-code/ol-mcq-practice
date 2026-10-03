-- OL MCQ Practice App - Initial Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SUBJECTS
-- ============================================
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_si VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    icon VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TOPICS
-- ============================================
CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    name_si VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAST PAPERS
-- ============================================
CREATE TABLE IF NOT EXISTS past_papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    paper_number INTEGER NOT NULL DEFAULT 1,
    title_si VARCHAR(500),
    title_en VARCHAR(500),
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- QUESTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    paper_id UUID REFERENCES past_papers(id) ON DELETE SET NULL,
    question_text_si TEXT NOT NULL,
    question_text_en TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    explanation_si TEXT,
    explanation_en TEXT,
    difficulty VARCHAR(10) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USERS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    password_hash VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER PROGRESS
-- ============================================
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_answer INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_taken INTEGER,
    answered_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER STATS
-- ============================================
CREATE TABLE IF NOT EXISTS user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    total_answered INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    last_active TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, subject_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_topics_subject_id ON topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_past_papers_subject_id ON past_papers(subject_id);
CREATE INDEX IF NOT EXISTS idx_past_papers_year ON past_papers(year);
CREATE INDEX IF NOT EXISTS idx_questions_topic_id ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_paper_id ON questions(paper_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_question_id ON user_progress(question_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_subject_id ON user_stats(subject_id);

-- ============================================
-- SEED DATA
-- ============================================
INSERT INTO subjects (name_si, name_en, icon, sort_order) VALUES
    ('ගණිතය', 'Mathematics', 'calculator', 1),
    ('විද්‍යාව', 'Science', 'flask', 2),
    ('ඉංග්‍රීසි', 'English', 'book', 3);

INSERT INTO topics (subject_id, name_si, name_en, sort_order)
SELECT s.id, t.name_si, t.name_en, t.sort_order
FROM subjects s
JOIN (VALUES
    ('ගණිතය', 'බිදුම්', 'Fractions', 1),
    ('ගණිතය', 'සංඛ්‍යා', 'Numbers', 2),
    ('ගණිතය', '�වර්ගඵල', 'Area', 3),
    ('ගණිතය', 'සමීකරණ', 'Equations', 4),
    ('විද්‍යාව', 'රසායන විද්‍යාව', 'Chemistry', 1),
    ('විද්‍යාව', 'භෞතික විද්‍යාව', 'Physics', 2),
    ('විද්‍යාව', 'ජීව විද්‍යාව', 'Biology', 3),
    ('ඉංග්‍රීසි', '්‍යාකරණය', 'Grammar', 1),
    ('ඉංග්‍රීසි', 'වචන මාලාව', 'Vocabulary', 2)
) AS t(subject_name, name_si, name_en, sort_order) ON s.name_en = t.subject_name;
