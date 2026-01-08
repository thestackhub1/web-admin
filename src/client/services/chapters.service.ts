import { authServerApi, isAuthenticated } from "@/lib/api";

export interface Chapter {
  id: string;
  name_en: string;
  name_mr?: string | null;
  description_en?: string | null;
  description_mr?: string | null;
  order_index: number;
  question_count?: number;
  questionCount?: number;
  is_active?: boolean;
}

export interface ChapterWithSubject extends Chapter {
  subject_id: string;
  subjects: {
    id: string;
    name_en: string;
    name_mr: string | null;
    slug: string;
    parent_subject_id: string | null;
  } | null;
}

/**
 * Fetch chapters for a subject
 */
export async function getChaptersBySubject(subjectSlug: string): Promise<Chapter[]> {
  if (!(await isAuthenticated())) return [];

  const { data, error } = await authServerApi.get<Chapter[]>(
    `/api/v1/subjects/${subjectSlug}/chapters`
  );

  if (error || !data) return [];
  return data;
}

/**
 * Fetch chapters with question counts
 */
export async function getChaptersWithCounts(subjectSlug: string): Promise<Chapter[]> {
  if (!(await isAuthenticated())) return [];

  const { data, error } = await authServerApi.get<Array<Chapter & { question_count: number }>>(
    `/api/v1/subjects/${subjectSlug}/chapters/with-counts`
  );

  if (error || !data) return [];

  return data.map((ch) => ({
    ...ch,
    questionCount: ch.question_count,
  }));
}

/**
 * Fetch chapter info by ID
 */
export async function getChapterById(chapterId: string): Promise<ChapterWithSubject | null> {
  if (!(await isAuthenticated())) return null;

  const { data, error } = await authServerApi.get<ChapterWithSubject>(
    `/api/v1/chapters/${chapterId}`
  );

  if (error || !data) return null;
  return data;
}
