// Client-side only — no server secrets or database access here

import { useApi } from './use-api';
import { api } from '@/client/api';
import { useMutation } from './use-mutations';

export interface ClassLevel {
  id: string;
  name_en: string;
  name_mr: string | null;
  slug: string;
  description_en?: string | null;
  description_mr?: string | null;
  icon?: string | null;
  order_index: number;
  is_active: boolean;
  subjects?: Array<{
    id: string;
    name_en: string;
    name_mr: string | null;
    slug: string;
  }>;
  studentCount?: number;
  examStructureCount?: number;
  scheduledExamCount?: number;
  examAttemptCount?: number;
}

export function useClassLevels() {
  return useApi<ClassLevel[]>(async () => {
    return api.get<ClassLevel[]>('/api/v1/class-levels');
  }, true);
}

export function useClassLevel(slug: string) {
  return useApi<ClassLevel>(async () => {
    return api.get<ClassLevel>(`/api/v1/class-levels/${slug}`);
  }, true);
}

// ============================================
// Subject Mapping Mutations
// ============================================

export function useAddSubjectToClassLevel() {
  return useMutation<{ success: boolean }, { classLevelSlug: string; subjectId: string }>(
    async ({ classLevelSlug, subjectId }) =>
      api.post(`/api/v1/class-levels/${classLevelSlug}/subjects`, { subject_id: subjectId }),
    {
      successMessage: 'Subject added to class level successfully',
      errorMessage: 'Failed to add subject to class level',
    }
  );
}

export function useRemoveSubjectFromClassLevel() {
  return useMutation<{ success: boolean }, { classLevelSlug: string; subjectId: string }>(
    async ({ classLevelSlug, subjectId }) =>
      api.delete(`/api/v1/class-levels/${classLevelSlug}/subjects/${subjectId}`),
    {
      successMessage: 'Subject removed from class level successfully',
      errorMessage: 'Failed to remove subject from class level',
    }
  );
}

export function useClassLevelSubjects(slug: string) {
  return useApi<Array<{
    id: string;
    name_en: string;
    name_mr: string | null;
    slug: string;
    description_en?: string | null;
    icon?: string | null;
    is_category: boolean;
    parent_subject_id: string | null;
    order_index: number;
  }>>(async () => {
    return api.get(`/api/v1/class-levels/${slug}/subjects`);
  }, true);
}

export function useClassLevelScheduledExams(slug: string, subjectId?: string) {
  return useApi(async () => {
    const url = subjectId
      ? `/api/v1/class-levels/${slug}/scheduled-exams?subject_id=${subjectId}`
      : `/api/v1/class-levels/${slug}/scheduled-exams`;
    return api.get(url);
  }, true);
}

// ============================================
// CRUD Mutations
// ============================================

export interface CreateClassLevelInput {
  name_en: string;
  name_mr?: string;
  description_en?: string;
  description_mr?: string;
  order_index?: number;
  slug?: string;
}

export interface UpdateClassLevelInput {
  name_en?: string;
  name_mr?: string;
  description_en?: string;
  description_mr?: string;
  order_index?: number;
  slug?: string;
  is_active?: boolean;
}

export function useCreateClassLevel() {
  return useMutation<ClassLevel, CreateClassLevelInput>(
    async (data) => api.post('/api/v1/class-levels', data),
    {
      successMessage: 'Class level created successfully',
      errorMessage: 'Failed to create class level',
    }
  );
}

export function useUpdateClassLevel(id: string) {
  return useMutation<ClassLevel, UpdateClassLevelInput>(
    async (data) => api.patch(`/api/v1/class-levels/${id}`, data),
    {
      successMessage: 'Class level updated successfully',
      errorMessage: 'Failed to update class level',
    }
  );
}

export function useDeleteClassLevel() {
  return useMutation<{ success: boolean; id: string }, string>(
    async (id) => api.delete(`/api/v1/class-levels/${id}`),
    {
      successMessage: 'Class level deleted successfully',
      errorMessage: 'Failed to delete class level',
    }
  );
}
