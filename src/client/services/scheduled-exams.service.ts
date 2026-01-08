import { authServerApi, isAuthenticated } from "@/lib/api";

export interface ScheduledExam {
  id: string;
  name_en: string;
  name_mr: string | null;
  description_en: string | null;
  description_mr: string | null;
  total_marks: number;
  duration_minutes: number;
  scheduled_date: string | null;
  scheduled_time: string | null;
  status: "draft" | "in_progress" | "completed" | "published" | "archived";
  is_active: boolean;
  publish_results: boolean;
  max_attempts: number;
  order_index: number;
  created_at: string;
  updated_at: string;
  class_level_id: string;
  subject_id: string;
  exam_structure_id: string | null;
  subjects?: {
    id: string;
    name_en: string;
    name_mr: string | null;
    slug: string;
  };
  class_levels?: {
    id: string;
    name_en: string;
    name_mr: string | null;
    slug: string;
  };
  exam_structures?: {
    id: string;
    name_en: string;
    name_mr: string | null;
    sections: Record<string, unknown>[];
    total_marks: number;
    total_questions: number;
    duration_minutes: number;
    passing_percentage: number;
  };
}

export interface ScheduledExamStats {
  totalAttempts: number;
  completedAttempts: number;
}

export interface AvailableExamStructure {
  id: string;
  name_en: string;
  name_mr: string;
  total_marks: number;
  total_questions: number;
  duration_minutes: number;
  sections: Record<string, unknown>[];
}

export interface ScheduledExamPreview {
  id: string;
  name_en: string;
  name_mr: string | null;
  subject: { id: string; name_en: string } | null;
  class_level: { id: string; name_en: string } | null;
  exam_structure: {
    total_marks: number;
    duration_minutes: number;
    passing_percentage: number;
  } | null;
  total_marks: number;
  duration_minutes: number;
}

/**
 * Fetch scheduled exam by ID
 */
export async function getScheduledExamById(id: string): Promise<ScheduledExam | null> {
  if (!(await isAuthenticated())) return null;

  const { data, error } = await authServerApi.get<ScheduledExam>(
    `/api/v1/scheduled-exams/${id}`
  );

  if (error || !data) {
    console.error("[ScheduledExam] Error:", error);
    return null;
  }

  return data;
}

/**
 * Fetch scheduled exam for preview (simplified)
 */
export async function getScheduledExamForPreview(id: string): Promise<ScheduledExamPreview | null> {
  const exam = await getScheduledExamById(id);
  if (!exam) return null;

  return {
    id: exam.id,
    name_en: exam.name_en,
    name_mr: exam.name_mr,
    subject: exam.subjects ? { id: exam.subjects.id, name_en: exam.subjects.name_en } : null,
    class_level: exam.class_levels ? { id: exam.class_levels.id, name_en: exam.class_levels.name_en } : null,
    exam_structure: exam.exam_structures ? {
      total_marks: exam.exam_structures.total_marks,
      duration_minutes: exam.exam_structures.duration_minutes,
      passing_percentage: exam.exam_structures.passing_percentage,
    } : null,
    total_marks: exam.total_marks,
    duration_minutes: exam.duration_minutes,
  };
}

/**
 * Fetch all scheduled exams
 */
export async function getScheduledExams(): Promise<ScheduledExam[]> {
  if (!(await isAuthenticated())) return [];

  const { data, error } = await authServerApi.get<ScheduledExam[]>("/api/v1/scheduled-exams");

  if (error || !data) {
    console.error("Failed to fetch scheduled exams:", error);
    return [];
  }

  return data;
}

/**
 * Fetch scheduled exam counts grouped by subject ID
 */
export async function getScheduledExamCountsBySubject(): Promise<Record<string, number>> {
  if (!(await isAuthenticated())) return {};

  const { data, error } = await authServerApi.get<Record<string, number>>(
    "/api/v1/scheduled-exams/counts-by-subject"
  );

  if (error || !data) {
    console.error("Failed to fetch scheduled exam counts:", error);
    return {};
  }

  return data;
}

/**
 * Fetch exam stats (attempts and completions)
 */
export async function getScheduledExamStats(examId: string): Promise<ScheduledExamStats> {
  if (!(await isAuthenticated())) {
    return { totalAttempts: 0, completedAttempts: 0 };
  }

  const { data, error } = await authServerApi.get<{
    total_attempts: number;
    completed_attempts: number;
  }>(`/api/v1/scheduled-exams/${examId}/stats`);

  if (error || !data) {
    console.error("Failed to fetch exam stats:", error);
    return { totalAttempts: 0, completedAttempts: 0 };
  }

  return {
    totalAttempts: data.total_attempts,
    completedAttempts: data.completed_attempts,
  };
}

/**
 * Fetch available exam structures for a class level and subject
 */
export async function getAvailableStructures(
  classLevelId: string,
  subjectId: string
): Promise<AvailableExamStructure[]> {
  if (!(await isAuthenticated())) return [];

  const searchParams = new URLSearchParams({ subject_id: subjectId });
  if (classLevelId) {
    searchParams.set("class_level_id", classLevelId);
  }

  const { data, error } = await authServerApi.get<AvailableExamStructure[]>(
    `/api/v1/exam-structures/available?${searchParams.toString()}`
  );

  if (error || !data) {
    console.error("Error fetching structures:", error);
    return [];
  }

  return data;
}
