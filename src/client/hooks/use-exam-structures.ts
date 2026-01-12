// Client-side only — no server secrets or database access here

import { useApi } from './use-api';
import { api } from '@/client/api';

export interface ExamStructure {
  id: string;
  name_en: string;
  name_mr: string | null;
  subject_id: string;
  class_level_id?: string | null;
  class_level?: string | null;
  duration_minutes: number;
  total_questions: number;
  total_marks: number;
  passing_percentage: number;
  sections: Array<{
    id: string;
    code: string;
    name_en: string;
    name_mr?: string;
    question_type: string;
    question_count: number;
    marks_per_question: number;
    total_marks: number;
    instructions_en?: string;
    instructions_mr?: string;
    order_index: number;
    chapter_ids?: string[];
    chapter_configs?: Array<{
      chapter_id: string;
      question_count: number;
    }>;
  }>;
  order_index: number;
  is_active: boolean;
  subjects?: {
    id: string;
    name_en: string;
    name_mr: string | null;
    slug: string;
  } | null;
}

export function useExamStructures(subjectId?: string) {
  return useApi<ExamStructure[]>(async () => {
    const url = subjectId
      ? `/api/v1/exam-structures?subject_id=${subjectId}`
      : '/api/v1/exam-structures';
    return api.get<ExamStructure[]>(url);
  }, true); // Auto-execute on mount
}

export function useExamStructure(id: string) {
  return useApi<ExamStructure>(async () => {
    return api.get<ExamStructure>(`/api/v1/exam-structures/${id}`);
  }, true); // Auto-execute on mount
}

export function useAvailableExamStructures(subjectId: string, classLevelId?: string) {
  return useApi<Array<{
    id: string;
    name_en: string;
    name_mr: string | null;
    total_marks: number;
    total_questions: number;
    duration_minutes: number;
    sections: ExamStructure['sections'];
  }>>(async () => {
    const url = classLevelId
      ? `/api/v1/exam-structures/available?subject_id=${subjectId}&class_level_id=${classLevelId}`
      : `/api/v1/exam-structures/available?subject_id=${subjectId}`;
    return api.get(url);
  });
}

// ============================================
// Mutation Hooks
// ============================================

export interface CreateExamStructureInput {
  name_en: string;
  name_mr: string;
  subject_id: string;
  class_level?: string | null;
  class_level_id?: string | null;
  is_template?: boolean;
  duration_minutes: number;
  total_marks: number;
  total_questions: number;
  passing_percentage: number;
  sections: Array<{
    code: string;
    name_en: string;
    name_mr: string;
    question_type: string;
    question_count: number;
    marks_per_question: number;
    total_marks: number;
    instructions_en?: string;
    instructions_mr?: string;
    order_index: number;
    chapter_configs?: Array<{
      chapter_id: string;
      question_count: number;
    }>;
  }>;
  is_active?: boolean;
}

export interface UpdateExamStructureInput extends Partial<CreateExamStructureInput> {
  id: string;
}

import { useMutation } from './use-mutations';

export function useCreateExamStructure() {
  return useMutation<ExamStructure, CreateExamStructureInput>(
    async (data) => api.post('/api/v1/exam-structures', data),
    {
      successMessage: 'Exam structure created successfully',
      errorMessage: 'Failed to create exam structure',
    }
  );
}

export function useUpdateExamStructure() {
  return useMutation<ExamStructure, UpdateExamStructureInput>(
    async (data) => {
      const { id, ...updateData } = data;
      return api.put(`/api/v1/exam-structures/${id}`, updateData);
    },
    {
      successMessage: 'Exam structure updated successfully',
      errorMessage: 'Failed to update exam structure',
    }
  );
}

export function useDeleteExamStructure() {
  return useMutation<{ success: boolean }, { id: string }>(
    async ({ id }) => api.delete(`/api/v1/exam-structures/${id}`),
    {
      successMessage: 'Exam structure deleted successfully',
      errorMessage: 'Failed to delete exam structure',
    }
  );
}

