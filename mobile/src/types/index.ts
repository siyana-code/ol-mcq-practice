export interface Subject {
  id: string;
  name_si: string;
  name_en: string;
  icon: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  subject_id: string;
  name_si: string;
  name_en: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  topic_id: string;
  paper_id: string | null;
  question_text_si: string;
  question_text_en: string;
  options: {
    text_si: string;
    text_en: string;
  }[];
  correct_answer: number;
  explanation_si: string | null;
  explanation_en: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PastPaper {
  id: string;
  subject_id: string;
  year: number;
  paper_number: number;
  title_si: string | null;
  title_en: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
}

export interface UserProgress {
  id: string;
  user_id: string;
  question_id: string;
  selected_answer: number;
  is_correct: boolean;
  time_taken: number | null;
  answered_at: string;
}

export interface UserStats {
  id: string;
  user_id: string;
  subject_id: string;
  total_answered: number;
  correct_count: number;
  streak: number;
  last_active: string | null;
}
