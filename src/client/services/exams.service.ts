import { authServerApi, isAuthenticated } from "@/lib/api";

export interface ExamAttempt {
  id: string;
  user_id: string;
  status: string;
  score: number | null;
  total_marks: number | null;
  percentage: number | null;
  started_at: string | null;
  completed_at: string | null;
  profiles: {
    name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
  subjects: {
    id: string;
    name_en: string;
  } | null;
  exam_structures: {
    id: string;
    name_en: string;
  } | null;
  scheduled_exams: {
    id: string;
    name_en: string;
  } | null;
}

interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next_page: boolean;
    has_previous_page: boolean;
  };
}

/**
 * Fetch exam attempts with optional user filter
 */
export async function getExamAttempts(userId?: string): Promise<ExamAttempt[]> {
  if (!(await isAuthenticated())) return [];

  const url = userId ? `/api/v1/exams?user_id=${userId}&page_size=100` : "/api/v1/exams?page_size=100";

  const { data, error } = await authServerApi.get<PaginatedResponse<ExamAttempt>>(url);

  if (error || !data) {
    console.error("Error fetching exams:", error);
    return [];
  }

  // Handle both paginated response and direct array (for backwards compatibility)
  return Array.isArray(data) ? data : (data.items || []);
}

/**
 * Alias for getExamAttempts for backward compatibility
 */
export const getExams = getExamAttempts;
