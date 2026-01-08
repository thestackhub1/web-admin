// Client-side only — no server secrets or database access here

import { useApi } from './use-api';
import { api } from '@/client/api';

export interface Subject {
  id: string;
  name_en: string;
  name_mr: string | null;
  slug: string;
  description_en?: string | null;
  description_mr?: string | null;
  icon?: string | null;
  order_index: number;
  is_active: boolean;
  is_category: boolean;
  is_paper: boolean;
  paper_number?: number | null;
  parent_subject_id?: string | null;
  sub_subjects?: Subject[];
}

export function useSubjects(classLevelId?: string) {
  return useApi<Subject[]>(async () => {
    const url = classLevelId
      ? `/api/v1/subjects?class_level_id=${classLevelId}`
      : '/api/v1/subjects';
    return api.get<Subject[]>(url);
  }, true);
}

export function useSubject(slug: string) {
  return useApi<Subject>(async () => {
    return api.get<Subject>(`/api/v1/subjects/${slug}`);
  }, true);
}

export function useSubjectById(id: string) {
  // The [slug] route now handles both UUIDs and slugs
  return useApi<Subject>(async () => {
    return api.get<Subject>(`/api/v1/subjects/${id}`);
  }, true);
}

export function useSubjectStats() {
  return useApi<{
    total_categories: number;
    root_subjects: number;
    total_chapters: number;
    total_questions: number;
  }>(async () => {
    return api.get('/api/v1/subjects/stats');
  }, true);
}

export function useSubjectsWithClassCounts() {
  return useApi<Array<Subject & { subject_class_mappings: Array<{ count: number }> }>>(
    async () => {
      return api.get('/api/v1/subjects/with-class-counts');
    },
    true
  );
}

export function useSubjectChildren(idOrSlug: string) {
  // The [slug]/children route now handles both UUIDs and slugs
  return useApi<Subject[]>(async () => {
    return api.get<Subject[]>(`/api/v1/subjects/${idOrSlug}/children`);
  }, true);
}

export function useSubjectChaptersWithCounts(slug: string) {
  return useApi<Array<{
    id: string;
    name_en: string;
    name_mr: string | null;
    description_en?: string | null;
    description_mr?: string | null;
    order_index: number;
    question_counts: Record<string, Record<string, number>>;
    total_questions: number;
  }>>(async () => {
    return api.get(`/api/v1/subjects/${slug}/chapters/with-counts`);
  }, true);
}

// ============================================
// Mutation Hooks
// ============================================

import { useMutation } from './use-mutations';

export interface UpdateSubjectInput {
  id: string;
  name_en?: string;
  name_mr?: string;
  slug?: string;
  icon?: string | null;
  is_active?: boolean;
}

export function useUpdateSubject() {
  return useMutation<Subject, UpdateSubjectInput>(
    async ({ id, ...data }) => api.put(`/api/v1/subjects/${id}`, data),
    {
      successMessage: 'Category updated successfully',
      errorMessage: 'Failed to update category',
    }
  );
}