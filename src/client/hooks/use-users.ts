// Client-side only — no server secrets or database access here

import { useApi } from './use-api';
import { api } from '@/client/api';

export interface User {
  id: string;
  email: string;
  phone?: string | null;
  name?: string | null;
  avatar_url?: string | null;
  school_id?: string | null;
  class_level?: string | null;
  role: string;
  preferred_language?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  schools?: {
    id: string;
    name: string;
  } | null;
  exam_stats?: {
    total: number;
    completed: number;
    passed: number;
    avg_score: number;
  };
  recent_exams?: Array<{
    id: string;
    status: string;
    score?: number | null;
    total_marks?: number | null;
    percentage?: number | null;
    started_at?: string | null;
    completed_at?: string | null;
  }>;
}

export function useUsers(filters?: {
  role?: string;
  schoolId?: string;
  classLevel?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  return useApi<{
    items: User[];
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
    if (filters?.role && filters.role !== 'all') params.append('role', filters.role);
    if (filters?.schoolId) params.append('schoolId', filters.schoolId);
    if (filters?.classLevel && filters.classLevel !== 'all') params.append('classLevel', filters.classLevel);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());

    const url = params.toString()
      ? `/api/v1/users?${params.toString()}`
      : '/api/v1/users';
    return api.get(url);
  });
}

export function useUser(id: string) {
  return useApi<User>(async () => {
    return api.get<User>(`/api/v1/users/${id}`);
  });
}



// User Mutation Types
export interface CreateUserDTO {
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
  password?: string;
  schoolId?: string;
  classLevel?: string;
  isActive?: boolean;
}

export interface UpdateUserDTO {
  name?: string;
  role?: string;
  schoolId?: string | null;
  classLevel?: string | null;
  isActive?: boolean;
  email?: string;
  phone?: string | null;
  preferred_language?: string | null;
  password?: string;
}

import { useMutation } from './use-mutations';

export function useCreateUser() {
  return useMutation<User, CreateUserDTO>(
    async (data) => api.post<User>('/api/v1/users', data),
    {
      successMessage: 'User created successfully',
    }
  );
}

export function useUpdateUser(userId: string) {
  return useMutation<User, UpdateUserDTO>(
    async (data) => api.patch<User>(`/api/v1/users/${userId}`, data),
    {
      successMessage: 'User updated successfully',
    }
  );
}

export function useDeleteUser() {
  return useMutation<{ success: boolean; message: string }, { userId: string; hardDelete?: boolean }>(
    async ({ userId, hardDelete }) =>
      api.delete<{ success: boolean; message: string }>(`/api/v1/users/${userId}${hardDelete ? '?hardDelete=true' : ''}`),
    {
      successMessage: 'User deleted successfully',
    }
  );
}
