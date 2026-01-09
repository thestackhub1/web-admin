// Client-side only — no server secrets or database access here

import { useApi } from './use-api';
import { api } from '@/client/api';

export interface Chapter {
  id: string;
  name_en: string;
  name_mr: string | null;
  description_en?: string | null;
  description_mr?: string | null;
  order_index: number;
  subject_id: string;
  subjects?: {
    id: string;
    name_en: string;
    name_mr: string | null;
    slug: string;
    parent_subject_id?: string | null;
  } | null;
}

export function useChapter(id: string) {
  return useApi<Chapter>(async () => {
    return api.get<Chapter>(`/api/v1/chapters/${id}`);
  });
}

export function useChaptersBySubject(slug: string) {
  return useApi<Array<{
    id: string;
    name_en: string;
    name_mr: string | null;
    description_en?: string | null;
    description_mr?: string | null;
    order_index: number;
  }>>(async () => {
    return api.get(`/api/v1/subjects/${slug}/chapters`);
  });
}

export function useChaptersWithCounts(slug: string) {
  return useApi<Array<{
    id: string;
    name_en: string;
    name_mr: string | null;
    description_en?: string | null;
    description_mr?: string | null;
    order_index: number;
    question_count: number;
  }>>(async () => {
    if (!slug) {
      return { data: [], error: null };
    }
    return api.get(`/api/v1/subjects/${slug}/chapters/with-counts`);
  }, { autoExecute: !!slug, dependencyKey: slug }); // Re-fetch when slug changes
}

import { useMutation } from './use-mutations';

/**
 * Create a new chapter
 */
export function useCreateChapter(subjectSlug: string) {
  return useMutation<Chapter, {
    name_en: string;
    name_mr: string;
    description_en?: string;
    description_mr?: string;
    order_index?: number;
  }>(
    async (data) => api.post(`/api/v1/subjects/${subjectSlug}/chapters`, data),
    {
      successMessage: 'Chapter created successfully',
      errorMessage: 'Failed to create chapter',
    }
  );
}

/**
 * Update a chapter
 */
export function useUpdateChapter(chapterId: string) {
  return useMutation<Chapter, {
    name_en?: string;
    name_mr?: string;
    description_en?: string;
    description_mr?: string;
    order_index?: number;
    is_active?: boolean;
  }>(
    async (data) => api.patch(`/api/v1/chapters/${chapterId}`, data),
    {
      successMessage: 'Chapter updated successfully',
      errorMessage: 'Failed to update chapter',
    }
  );
}

/**
 * Delete a chapter
 */
export function useDeleteChapter() {
  return useMutation<{ success: boolean; message: string }, string>(
    async (chapterId) => api.delete(`/api/v1/chapters/${chapterId}`),
    {
      successMessage: 'Chapter deleted successfully',
      errorMessage: 'Failed to delete chapter',
    }
  );
}
