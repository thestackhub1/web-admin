// Client-side only — no server secrets or database access here

import { useApi } from './use-api';
import { useMutation } from './use-mutations';
import { api } from '@/client/api';

export interface ExamAttempt {
  id: string;
  user_id: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  score?: number | null;
  total_marks?: number | null;
  percentage?: number | null;
  started_at?: string | null;
  completed_at?: string | null;
  subject_id?: string | null;
  exam_structure_id?: string | null;
  scheduled_exam_id?: string | null;
}

export interface ExamAnswer {
  id: string;
  exam_id: string;
  question_id: string;
  question_table: string;
  user_answer: any;
  is_correct: boolean | null;
  marks_obtained: number;
  created_at: string;
  question?: {
    id: string;
    question_text: string;
    question_language: 'en' | 'mr';
    question_text_secondary?: string | null;
    secondary_language?: 'en' | 'mr' | null;
    question_type: string;
    answer_data: any;
    marks: number;
    explanation_en?: string;
    explanation_mr?: string;
    chapter?: {
      name_en: string;
      name_mr: string;
    };
  };
}

export function useExamAttempt(id: string) {
  return useApi<ExamAttempt & {
    answers?: ExamAnswer[];
    profile?: {
      id: string;
      name: string | null;
      email: string;
      avatar_url: string | null;
    };
    subject?: {
      id: string;
      name_en: string;
    };
    exam_structure?: {
      id: string;
      name_en: string;
    };
    scheduled_exam?: {
      id: string;
      name_en: string;
    };
  }>(async () => {
    return api.get(`/api/v1/exams/${id}`);
  });
}

export function useExamAnswers(examId: string) {
  return useApi<ExamAnswer[]>(async () => {
    return api.get<ExamAnswer[]>(`/api/v1/exams/${examId}/answers`);
  });
}

export function useDeleteExamAttempt() {
  return useMutation<{ success: boolean }, { id: string }>(
    async ({ id }) => api.delete(`/api/v1/exams/${id}`),
    {
      successMessage: 'Exam attempt deleted successfully',
      errorMessage: 'Failed to delete exam attempt',
    }
  );
}

// Note: useBulkDeleteExamAttempts is exported from use-exams.ts
