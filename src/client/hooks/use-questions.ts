// Client-side only — no server secrets or database access here

import { useApi } from './use-api';
import { api } from '@/client/api';

export interface Question {
  id: string;
  question_text: string;
  question_text_en: string;
  question_text_mr?: string | null;
  question_language: string;
  question_type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  answer_data: any;
  explanation_en?: string | null;
  explanation_mr?: string | null;
  tags?: string[] | null;
  class_level?: string | null;
  marks: number;
  chapter_id?: string | null;
  is_active: boolean;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export function useQuestions(
  subject: string,
  filters?: {
    chapterId?: string;
    difficulty?: string;
    type?: string;
    limit?: number;
  }
) {
  return useApi<Question[]>(async () => {
    const params = new URLSearchParams();
    if (filters?.chapterId) params.append('chapter_id', filters.chapterId);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const url = params.toString()
      ? `/api/v1/subjects/${subject}/questions?${params.toString()}`
      : `/api/v1/subjects/${subject}/questions`;
    return api.get<Question[]>(url);
  });
}

export function useQuestionCountsByChapter(subject: string, chapterId: string) {
  return useApi<{
    counts: Record<string, Record<string, number>>;
    total: number;
    mcq: number;
    mcq_single: number;
    mcq_double: number;
    mcq_triple: number;
    true_false: number;
    fill_blank: number;
    match: number;
    short_answer: number;
    programming: number;
  }>(async () => {
    return api.get(`/api/v1/subjects/${subject}/chapters/${chapterId}/question-counts`);
  });
}

/**
 * Hook to fetch all questions across subjects with optional filters
 * Used by the main Questions dashboard
 */
export function useAllQuestions(filters?: {
  search?: string;
  subject?: string;
  difficulty?: string;
  type?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  // Build dependency key from filters to refetch when they change
  const dependencyKey = JSON.stringify(filters || {});
  
  return useApi<Question[]>(async () => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.subject) params.append('subject', filters.subject);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    
    const url = params.toString()
      ? `/api/v1/questions?${params.toString()}`
      : `/api/v1/questions`;
    return api.get<Question[]>(url);
  }, { autoExecute: true, dependencyKey });
}

export function useQuestionsByIds(subject: string, questionIds: string[]) {
  return useApi<Question[]>(async () => {
    return api.post<Question[]>(`/api/v1/subjects/${subject}/questions/by-ids`, {
      question_ids: questionIds,
    });
  });
}

export function useQuestion(subject: string, questionId: string) {
  return useApi<Question>(async () => {
    return api.get<Question>(`/api/v1/subjects/${subject}/questions/${questionId}`);
  });
}

// ============================================
// Mutation Hooks
// ============================================

export interface CreateQuestionInput {
  question_text: string;
  question_language: 'en' | 'mr';
  question_text_secondary?: string | null;
  secondary_language?: 'en' | 'mr' | null;
  question_type: string;
  difficulty: string;
  chapter_id?: string | null;
  answer_data: any;
  explanation_en?: string | null;
  explanation_mr?: string | null;
  tags?: string[];
  class_level?: string | null;
  marks?: number;
  is_active?: boolean;
}

export interface UpdateQuestionInput extends Partial<CreateQuestionInput> {
  subject: string;
  id: string;
}

import { useMutation } from './use-mutations';

export function useCreateQuestion(subject: string) {
  return useMutation<Question, CreateQuestionInput>(
    async (data) => api.post(`/api/v1/subjects/${subject}/questions`, data),
    {
      successMessage: 'Question created successfully',
      errorMessage: 'Failed to create question',
    }
  );
}

export function useUpdateQuestion(subject: string) {
  return useMutation<Question, UpdateQuestionInput>(
    async (data) => {
      const { id, subject: _subject, ...updateData } = data;
      return api.put(`/api/v1/subjects/${subject}/questions/${id}`, updateData);
    },
    {
      successMessage: 'Question updated successfully',
      errorMessage: 'Failed to update question',
    }
  );
}

export function useDeleteQuestion(subject: string) {
  return useMutation<{ success: boolean }, { id: string }>(
    async ({ id }) => api.delete(`/api/v1/subjects/${subject}/questions/${id}`),
    {
      successMessage: 'Question deleted successfully',
      errorMessage: 'Failed to delete question',
    }
  );
}

export function useBulkUpdateQuestionStatus(subject: string) {
  return useMutation<{ success: boolean }, { ids: string[]; is_active: boolean }>(
    async ({ ids, is_active }) => {
      // Update each question individually
      const results = await Promise.all(
        ids.map(id => api.put(`/api/v1/subjects/${subject}/questions/${id}`, { is_active }))
      );
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        return { data: null, error: `Failed to update ${errors.length} questions` };
      }
      return { data: { success: true }, error: null };
    },
    {
      successMessage: 'Questions updated successfully',
      errorMessage: 'Failed to update questions',
    }
  );
}

export function useBulkDeleteQuestions(subject: string) {
  return useMutation<{ success: boolean }, { ids: string[] }>(
    async ({ ids }) => {
      // Delete each question individually
      const results = await Promise.all(
        ids.map(id => api.delete(`/api/v1/subjects/${subject}/questions/${id}`))
      );
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        return { data: null, error: `Failed to delete ${errors.length} questions` };
      }
      return { data: { success: true }, error: null };
    },
    {
      successMessage: 'Questions deleted successfully',
      errorMessage: 'Failed to delete questions',
    }
  );
}

