// Client-side only — no server secrets or database access here

import { useApi } from './use-api';
import { api } from '@/client/api';

export interface ScheduledExam {
  id: string;
  name_en: string;
  name_mr: string | null;
  description_en?: string | null;
  description_mr?: string | null;
  total_marks: number;
  duration_minutes: number;
  scheduled_date: string;
  scheduled_time: string;
  status: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled';
  order_index: number;
  class_level_id: string;
  subject_id: string;
  exam_structure_id: string;
  max_attempts: number;
  publish_results: boolean;
  is_active: boolean;
  class_levels?: {
    id: string;
    name_en: string;
    name_mr: string | null;
    slug: string;
  } | null;
  subjects?: {
    id: string;
    name_en: string;
    name_mr: string | null;
    slug: string;
  } | null;
  exam_structures?: {
    id: string;
    name_en: string;
    name_mr: string | null;
    sections: any[];
    total_marks: number;
    total_questions: number;
    duration_minutes: number;
    passing_percentage: number;
  } | null;
  attempts_count?: number;
  completed_attempts?: number;
}

export function useScheduledExams(filters?: {
  subjectId?: string;
  subjectSlug?: string;
  classLevelId?: string;
  status?: string;
}) {
  return useApi<ScheduledExam[]>(async () => {
    const params = new URLSearchParams();
    if (filters?.subjectId) params.append('subject_id', filters.subjectId);
    if (filters?.subjectSlug) params.append('subject_slug', filters.subjectSlug);
    if (filters?.classLevelId) params.append('class_level_id', filters.classLevelId);
    if (filters?.status) params.append('status', filters.status);
    
    const url = params.toString()
      ? `/api/v1/scheduled-exams?${params.toString()}`
      : '/api/v1/scheduled-exams';
    return api.get<ScheduledExam[]>(url);
  }, true); // Auto-execute on mount
}

export function useScheduledExam(id: string) {
  return useApi<ScheduledExam>(async () => {
    return api.get<ScheduledExam>(`/api/v1/scheduled-exams/${id}`);
  });
}

export function useScheduledExamStats(id: string) {
  return useApi<{
    total_attempts: number;
    completed_attempts: number;
  }>(async () => {
    return api.get(`/api/v1/scheduled-exams/${id}/stats`);
  });
}

export function useScheduledExamPreview(id: string) {
  return useApi<{
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
      questions: any[];
    }>;
  }>(async () => {
    return api.get(`/api/v1/scheduled-exams/${id}/preview`);
  }, true); // Auto-execute on mount
}

export function useScheduledExamCountsBySubject() {
  return useApi<Record<string, number>>(async () => {
    return api.get('/api/v1/scheduled-exams/counts-by-subject');
  });
}

// ============================================
// Mutation Hooks
// ============================================

export interface CreateScheduledExamInput {
  name_en: string;
  name_mr: string;
  description_en?: string | null;
  description_mr?: string | null;
  class_level_id: string;
  subject_id: string;
  exam_structure_id?: string | null;
  total_marks: number;
  duration_minutes: number;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  status?: string;
  order_index?: number;
  is_active?: boolean;
  publish_results?: boolean;
  max_attempts?: number;
}

export interface UpdateScheduledExamInput extends Partial<CreateScheduledExamInput> {
  id: string;
}

import { useMutation } from './use-mutations';

export function useCreateScheduledExam() {
  return useMutation<ScheduledExam, CreateScheduledExamInput>(
    async (data) => api.post('/api/v1/scheduled-exams', data),
    {
      successMessage: 'Scheduled exam created successfully',
      errorMessage: 'Failed to create scheduled exam',
    }
  );
}

export function useUpdateScheduledExam() {
  return useMutation<ScheduledExam, UpdateScheduledExamInput>(
    async (data) => {
      const { id, ...updateData } = data;
      return api.put(`/api/v1/scheduled-exams/${id}`, updateData);
    },
    {
      successMessage: 'Scheduled exam updated successfully',
      errorMessage: 'Failed to update scheduled exam',
    }
  );
}

export function useDeleteScheduledExam() {
  return useMutation<{ success: boolean }, { id: string }>(
    async ({ id }) => api.delete(`/api/v1/scheduled-exams/${id}`),
    {
      successMessage: 'Scheduled exam deleted successfully',
      errorMessage: 'Failed to delete scheduled exam',
    }
  );
}

export function useUpdateScheduledExamStatus() {
  return useMutation<{ success: boolean }, { id: string; status: string }>(
    async ({ id, status }) => api.patch(`/api/v1/scheduled-exams/${id}`, { status }),
    {
      successMessage: 'Status updated successfully',
      errorMessage: 'Failed to update status',
    }
  );
}

