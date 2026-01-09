import { authServerApi, isAuthenticated } from "@/lib/api";

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  name?: string | null;
  role: string;
  avatar_url: string | null;
  is_active: boolean;
  school_id: string | null;
  class_level_id: string | null;
  phone?: string | null;
  preferred_language?: string | null;
  created_at: string;
  updated_at: string;
  schools?: {
    id: string;
    name: string;
  };
}

interface UserExamAttemptSummary {
  id: string;
  status: string;
  score: number | null;
  total_marks: number | null;
  started_at: string | null;
}

export interface UserExamStats {
  total: number;
  completed: number;
  passed: number;
  avg_score: number;
}

export interface UserDetailProfile extends UserProfile {
  exam_stats: UserExamStats;
  recent_exams: UserExamAttemptSummary[];
}

export interface UsersApiResponse {
  items: UserProfile[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface UserStats {
  admins: number;
  teachers: number;
  students: number;
}

export interface CurrentUser {
  id: string;
  role: string;
  school_id?: string | null;
}

/**
 * Get current authenticated user profile
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!(await isAuthenticated())) return null;

  const { data } = await authServerApi.get<CurrentUser>("/api/v1/profile");

  return data || null;
}

/**
 * Get full profile of current user
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  if (!(await isAuthenticated())) return null;

  const { data } = await authServerApi.get<UserProfile>("/api/v1/profile");

  return data || null;
}

/**
 * Fetch users list with filters
 */
export async function getUsers(filters: {
  schoolId?: string;
  role?: string;
  search?: string;
  classLevelId?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<UserProfile[]> {
  if (!(await isAuthenticated())) return [];

  const params = new URLSearchParams();
  if (filters.schoolId) params.append("schoolId", filters.schoolId);
  if (filters.role && filters.role !== "all") params.append("role", filters.role);
  if (filters.search) params.append("search", filters.search);
  if (filters.classLevelId) params.append("classLevelId", filters.classLevelId);
  params.append("page", (filters.page || 1).toString());
  params.append("pageSize", (filters.pageSize || 100).toString());

  const url = `/api/v1/users?${params.toString()}`;

  const { data, error } = await authServerApi.get<UsersApiResponse>(url);

  if (error || !data) {
    console.error("Failed to fetch users:", error);
    return [];
  }

  return data.items;
}

/**
 * Fetch a single user by ID with exam stats and recent exams
 */
export async function getUserById(id: string): Promise<UserDetailProfile | null> {
  if (!(await isAuthenticated())) return null;

  const { data, error } = await authServerApi.get<UserDetailProfile>(`/api/v1/users/${id}`);

  if (error || !data) {
    console.error("Failed to fetch user:", error);
    return null;
  }

  // Provide defaults for exam stats if not returned by API
  return {
    ...data,
    exam_stats: data.exam_stats ?? { total: 0, completed: 0, passed: 0, avg_score: 0 },
    recent_exams: data.recent_exams ?? [],
  };
}

/**
 * Get user statistics (counts by role)
 */
export async function getUserStats(filters: { schoolId?: string; search?: string } = {}): Promise<UserStats> {
  if (!(await isAuthenticated())) {
    return { admins: 0, teachers: 0, students: 0 };
  }

  const baseParams = new URLSearchParams();
  if (filters.schoolId) baseParams.append("schoolId", filters.schoolId);
  if (filters.search) baseParams.append("search", filters.search);

  const [adminResult, teacherResult, studentResult] = await Promise.all([
    authServerApi.get<UsersApiResponse>(`/api/v1/users?role=admin&pageSize=1&${baseParams.toString()}`),
    authServerApi.get<UsersApiResponse>(`/api/v1/users?role=teacher&pageSize=1&${baseParams.toString()}`),
    authServerApi.get<UsersApiResponse>(`/api/v1/users?role=student&pageSize=1&${baseParams.toString()}`),
  ]);

  return {
    admins: adminResult.data?.pagination?.totalItems || 0,
    teachers: teacherResult.data?.pagination?.totalItems || 0,
    students: studentResult.data?.pagination?.totalItems || 0,
  };
}

/**
 * Check if current user has admin access
 */
export async function checkAdminAccess(): Promise<boolean> {
  const { data, status } = await authServerApi.get<UsersApiResponse>("/api/v1/users?pageSize=1");

  // 403 means authenticated but not admin, 401 means not authenticated
  if (status === 403 || status === 401) {
    return false;
  }

  return !!data;
}
