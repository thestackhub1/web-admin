import { authServerApi, isAuthenticated } from "@/lib/api";
import { api } from "@/client/api";

export interface School {
  id: string;
  name: string;
  location_city?: string | null;
  location_state?: string | null;
  is_active?: boolean;
  student_count?: number;
  teacher_count?: number;
  created_at?: string;
}

export interface SchoolsApiResponse {
  items: School[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface SchoolStats {
  total: number;
  active: number;
  inactive: number;
  totalStudents: number;
  totalTeachers: number;
}

/**
 * Fetch all schools
 */
export async function getSchools(): Promise<School[]> {
  if (!(await isAuthenticated())) return [];

  const { data, error } = await authServerApi.get<SchoolsApiResponse>("/api/v1/schools?pageSize=100");

  if (error || !data) {
    console.error("Failed to fetch schools:", error);
    return [];
  }

  return data.items;
}

/**
 * Fetch a single school by ID
 */
export async function getSchoolById(id: string): Promise<School | null> {
  if (!(await isAuthenticated())) return null;

  const { data, error } = await authServerApi.get<School>(`/api/v1/schools/${id}`);

  if (error || !data) {
    console.error("Failed to fetch school:", error);
    return null;
  }

  return data;
}

/**
 * Get school statistics
 */
export async function getSchoolStats(): Promise<SchoolStats> {
  if (!(await isAuthenticated())) {
    return { total: 0, active: 0, inactive: 0, totalStudents: 0, totalTeachers: 0 };
  }

  const { data, error } = await authServerApi.get<SchoolStats>("/api/v1/schools/stats");

  if (error || !data) {
    return { total: 0, active: 0, inactive: 0, totalStudents: 0, totalTeachers: 0 };
  }

  return data;
}

/**
 * Schools API for Client Components (Compatibility)
 */
export const schoolsApi = {
  async search(params: { q: string; limit?: number }) {
    const { data, error } = await api.get<School[]>(
      `/api/v1/schools/search?q=${encodeURIComponent(params.q)}&limit=${params.limit || 20}`
    );
    return { success: !error, data, error: error ? String(error) : undefined };
  },
  async suggest(limit: number = 10) {
    const { data, error } = await api.get<School[]>(`/api/v1/schools/suggest?limit=${limit}`);
    return { success: !error, data, error: error ? String(error) : undefined };
  },
  async create(payload: any) {
    const { data, error } = await api.post<School>('/api/v1/schools', payload);
    return { success: !error, data, error: error ? String(error) : undefined };
  }
};
