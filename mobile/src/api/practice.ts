import apiClient from './client';
import type { BasketKey } from '../types';

export type PracticeMode = 'timed' | 'untimed';
export type SessionStatus = 'active' | 'completed' | 'abandoned';

/** Question as delivered to a student. Deliberately has no answer key. */
export interface StudentQuestion {
  id: string;
  question_text_si: string;
  question_text_en: string;
  options: { text_si: string; text_en: string }[];
  difficulty: 'easy' | 'medium' | 'hard';
  image_url: string | null;
  /** Restored from a previous visit so going back keeps the student's choice. */
  selected_answer: number | null;
}

export interface SessionSummary {
  id: string;
  subject_id: string;
  topic_id: string | null;
  mode: PracticeMode;
  status: SessionStatus;
  total_questions: number;
  answered_count: number;
  correct_count: number;
  skipped_count: number;
  started_at: string;
  elapsed_seconds?: number;
  ended_at?: string | null;
  percentage?: number;
}

export interface AnswerResult {
  is_skipped: boolean;
  is_correct: boolean | null;
  /** Released only after the student answers. */
  correct_index: number;
  explanation_si: string | null;
  explanation_en: string | null;
}

export interface ReviewRow {
  question_id: string;
  selected_answer: number | null;
  is_correct: boolean | null;
  correct_answer: number;
  question_text_si: string;
  options: { text_si: string; text_en: string }[];
}

export interface SessionResult extends SessionSummary {
  review: ReviewRow[];
}

export const practiceApi = {
  async start(params: {
    subject_id: string;
    topic_id?: string | null;
    mode: PracticeMode;
    limit?: number;
  }): Promise<SessionSummary> {
    const { data } = await apiClient.post<{ session: SessionSummary }>(
      '/practice/sessions',
      params,
    );
    return data.session;
  },

  async questions(sessionId: string): Promise<{
    session: SessionSummary;
    questions: StudentQuestion[];
  }> {
    const { data } = await apiClient.get<{
      session: SessionSummary;
      questions: StudentQuestion[];
    }>(`/practice/sessions/${sessionId}/questions`);
    return data;
  },

  /** Send null to record a skip. The server grades and reveals the answer. */
  async answer(
    sessionId: string,
    params: {
      question_id: string;
      selected_answer: number | null;
      time_taken?: number;
    },
  ): Promise<AnswerResult> {
    const { data } = await apiClient.post<AnswerResult>(
      `/practice/sessions/${sessionId}/answers`,
      params,
    );
    return data;
  },

  async finish(
    sessionId: string,
    params: { elapsed_seconds: number; status?: SessionStatus },
  ): Promise<SessionResult> {
    const { data } = await apiClient.post<SessionResult>(
      `/practice/sessions/${sessionId}/finish`,
      params,
    );
    return data;
  },

  async history(limit = 20): Promise<SessionSummary[]> {
    const { data } = await apiClient.get<SessionSummary[]>('/practice/sessions', {
      params: { limit },
    });
    return data;
  },
};

export type { BasketKey };