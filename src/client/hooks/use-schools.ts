// Client-side only — no server secrets or database access here

import { useApi } from './use-api';
import { api } from '@/client/api';

export interface School {
  id: string;
  name: string;
  name_search?: string | null;
  location_city?: string | null;
  location_state?: string | null;
  location_country?: string | null;
  is_verified?: boolean;
  is_user_added?: boolean;
  created_by?: string | null;
  student_count?: number;
  created_at?: string;
  updated_at?: string;
  // Aliases for backwards compatibility
  city?: string | null;
  state?: string | null;
  is_active?: boolean;
}

export function useSchools(autoExecute: boolean = true) {
  return useApi<School[]>(async () => {
    return api.get<School[]>('/api/v1/schools');
  }, autoExecute);
}

export function useSchool(id: string, autoExecute: boolean = true) {
  return useApi<School>(async () => {
    return api.get<School>(`/api/v1/schools/${id}`);
  }, autoExecute);
}

export function useSchoolSearch(query: string) {
  return useApi<School[]>(async () => {
    if (!query.trim()) return { data: [], error: null };
    return api.get<School[]>(`/api/v1/schools/search?q=${encodeURIComponent(query)}`);
  });
}

export function useSchoolSuggest(query: string, limit: number = 10) {
  return useApi<School[]>(async () => {
    if (!query.trim()) return { data: [], error: null };
    return api.get<School[]>(`/api/v1/schools/suggest?q=${encodeURIComponent(query)}&limit=${limit}`);
  });
}

// ============================================
// Mutation Hooks
// ============================================

export interface CreateSchoolInput {
  name: string;
  location_city?: string | null;
  location_state?: string | null;
  location_country?: string | null;
}

export interface UpdateSchoolInput extends Partial<CreateSchoolInput> {
  id: string;
  is_verified?: boolean;
}

import { useMutation } from './use-mutations';

export function useCreateSchool() {
  return useMutation<School, CreateSchoolInput>(
    async (data) => api.post('/api/v1/schools', data),
    {
      successMessage: 'School created successfully',
      errorMessage: 'Failed to create school',
    }
  );
}

export function useUpdateSchool() {
  return useMutation<School, UpdateSchoolInput>(
    async (data) => {
      const { id, ...updateData } = data;
      return api.put(`/api/v1/schools/${id}`, updateData);
    },
    {
      successMessage: 'School updated successfully',
      errorMessage: 'Failed to update school',
    }
  );
}

export function useDeleteSchool() {
  return useMutation<{ success: boolean }, { id: string }>(
    async ({ id }) => api.delete(`/api/v1/schools/${id}`),
    {
      successMessage: 'School deleted successfully',
      errorMessage: 'Failed to delete school',
    }
  );
}

export function useVerifySchool() {
  return useMutation<School, { id: string; is_verified: boolean }>(
    async ({ id, is_verified }) => api.put(`/api/v1/schools/${id}`, { is_verified }),
    {
      successMessage: 'School status updated successfully',
      errorMessage: 'Failed to update school verification status',
    }
  );
}

