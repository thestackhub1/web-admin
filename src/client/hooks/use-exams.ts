// Client-side only — no server secrets or database access here

import { useApi } from './use-api';
import { api } from '@/client/api';

export interface Exam {
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
  profile?: {
    id: string;
    name: string | null;
    email: string;
    avatar_url?: string | null;
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
}

export function useExams(filters?: {
  userId?: string;
  subjectId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  return useApi<{
    items: Exam[];
    pagination: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }>(async () => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('user_id', filters.userId);
    if (filters?.subjectId) params.append('subject_id', filters.subjectId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('page_size', filters.pageSize.toString());
    
    const url = params.toString()
      ? `/api/v1/exams?${params.toString()}`
      : '/api/v1/exams';
    return api.get(url);
  }, true);
}

export function useRecentActivity(filters?: {
  limit?: number;
}) {
  return useApi<Exam[]>(async () => {
    const params = new URLSearchParams();
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const url = params.toString()
      ? `/api/v1/analytics/recent-activity?${params.toString()}`
      : '/api/v1/analytics/recent-activity';
    return api.get<Exam[]>(url);
  }, true);
}

// ============================================
// Mutation Hooks
// ============================================

import { useMutation } from './use-mutations';

export function useDeleteExam() {
  return useMutation<{ success: boolean }, { id: string }>(
    async ({ id }) => api.delete(`/api/v1/exams/${id}`),
    {
      successMessage: 'Exam attempt deleted successfully',
      errorMessage: 'Failed to delete exam attempt',
    }
  );
}

export function useBulkDeleteExamAttempts() {
  return useMutation<{ success: boolean; deletedCount: number }, { ids: string[] }>(
    async ({ ids }) => {
      // Delete each exam attempt individually
      const results = await Promise.all(
        ids.map(id => api.delete(`/api/v1/exams/${id}`))
      );
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        return { data: null, error: `Failed to delete ${errors.length} exam attempts` };
      }
      return { data: { success: true, deletedCount: ids.length }, error: null };
    },
    {
      successMessage: 'Exam attempts deleted successfully',
      errorMessage: 'Failed to delete exam attempts',
    }
  );
}

