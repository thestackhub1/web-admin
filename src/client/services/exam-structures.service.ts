import { authServerApi, isAuthenticated } from "@/lib/api";

export interface ExamStructure {
  id: string;
  name_en: string;
  name_mr: string | null;
  subject_id: string;
  class_level: string;
  class_level_id: string | null;
  is_template: boolean;
  duration_minutes: number;
  total_marks: number;
  passing_percentage: number;
  sections: Array<unknown>;
  is_active: boolean;
}

/**
 * Fetch exam structure by ID
 */
export async function getExamStructureById(id: string): Promise<ExamStructure | null> {
  if (!(await isAuthenticated())) return null;

  const { data, error } = await authServerApi.get<ExamStructure>(
    `/api/v1/exam-structures/${id}`
  );

  if (error || !data) {
    console.error("Failed to fetch exam structure:", error);
    return null;
  }

  return data;
}

/**
 * Fetch all exam structures
 */
export async function getExamStructures(): Promise<ExamStructure[]> {
  if (!(await isAuthenticated())) return [];

  const { data, error } = await authServerApi.get<ExamStructure[]>("/api/v1/exam-structures");

  if (error || !data) {
    console.error("Failed to fetch exam structures:", error);
    return [];
  }

  return data;
}
