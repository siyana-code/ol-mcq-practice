export type MotherLanguage = 'sinhala' | 'tamil';
export type Religion = 'buddhism' | 'christianity' | 'islam' | 'shaivism';
export type SubjectCategory = 'mandatory' | 'basket1' | 'basket2' | 'basket3';
export type BasketKey = 'basket1' | 'basket2' | 'basket3';

export interface Topic {
  id: string;
  subject_id: string;
  name_si: string;
  name_en: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  /** Present on topic endpoints. */
  question_count?: number;
}

export interface Subject {
  id: string;
  name_si: string;
  name_en: string;
  icon: string | null;
  sort_order: number;
  category: SubjectCategory;
  is_mcq: boolean;
  /** Present on /api/subjects/:id and /api/profile/my-subjects. */
  topics?: Topic[];
  /** Rollup across the subject's topics, on /api/profile/my-subjects. */
  question_count?: number;
  /** Only present on the user's chosen basket subjects. */
  basket?: number;
}

export interface SubjectSelection {
  id: string;
  name_si: string;
  name_en: string;
  icon: string | null;
  is_mcq: boolean;
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  mother_language: MotherLanguage | null;
  religion: Religion | null;
  onboarded_at: string | null;
  onboarded: boolean;
  complete: boolean;
  selections: Record<BasketKey, SubjectSelection | null>;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    mother_language?: MotherLanguage | null;
    religion?: Religion | null;
  };
  token: string;
}

export interface QuestionOption {
  text_si: string;
  text_en: string;
}

export interface Question {
  id: string;
  topic_id: string;
  paper_id: string | null;
  question_text_si: string;
  question_text_en: string;
  options: QuestionOption[];
  correct_answer: number;
  explanation_si: string | null;
  explanation_en: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  image_url: string | null;
}

export interface PastPaper {
  id: string;
  subject_id: string;
  year: number;
  paper_number: number;
  title_si: string | null;
  title_en: string | null;
  pdf_url: string | null;
}