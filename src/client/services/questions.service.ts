import { authServerApi, isAuthenticated } from "@/lib/api";
import type { QuestionType, Difficulty } from "@/client/types/questions";

export interface Question {
  id: string;
  question_text: string;
  question_text_en: string;
  question_text_mr?: string | null;
  question_language: "en" | "mr";
  question_type: QuestionType;
  difficulty: Difficulty;
  answer_data: Record<string, unknown>;
  chapter_id: string | null;
  tags: string[];
  is_active: boolean;
}

export interface QuestionStats {
  total: number;
  withChapter: number;
  withoutChapter: number;
  byDifficulty: Record<string, number>;
  byType: Record<string, number>;
}

export interface CategoryAggregatedStats extends QuestionStats {
  totalChapters: number;
  childSubjects: Array<{
    id: string;
    name_en: string;
    slug: string;
    stats: QuestionStats;
    chapterCount: number;
  }>;
}

const defaultQuestionStats: QuestionStats = {
  total: 0,
  withChapter: 0,
  withoutChapter: 0,
  byDifficulty: {},
  byType: {},
};

/**
 * Fetch questions for a subject
 */
export async function getQuestionsBySubject(subjectSlug: string): Promise<Question[]> {
  if (!(await isAuthenticated())) return [];

  const { data, error } = await authServerApi.get<Question[]>(
    `/api/v1/subjects/${subjectSlug}/questions`
  );

  if (error || !data) {
    console.error("Error fetching questions:", error);
    return [];
  }

  return data;
}

/**
 * Fetch questions for a specific chapter
 */
export async function getQuestionsByChapter(
  subjectSlug: string,
  chapterId: string
): Promise<Question[]> {
  if (!(await isAuthenticated())) return [];

  const { data, error } = await authServerApi.get<Question[]>(
    `/api/v1/subjects/${subjectSlug}/chapters/${chapterId}/questions`
  );

  if (error || !data) return [];
  return data;
}

/**
 * Fetch a single question by ID
 */
export async function getQuestionById(
  subjectSlug: string,
  questionId: string
): Promise<Question | null> {
  if (!(await isAuthenticated())) return null;

  const { data, error } = await authServerApi.get<Question>(
    `/api/v1/subjects/${subjectSlug}/questions/${questionId}`
  );

  if (error || !data) return null;
  return data;
}

/**
 * Fetch question statistics for a subject
 */
export async function getQuestionStats(subjectSlug: string): Promise<QuestionStats> {
  if (!(await isAuthenticated())) return defaultQuestionStats;

  const { data, error } = await authServerApi.get<{
    total: number;
    with_chapter: number;
    without_chapter: number;
    by_difficulty: Record<string, number>;
    by_type: Record<string, number>;
  }>(`/api/v1/subjects/${subjectSlug}/questions/stats`);

  if (error || !data) return defaultQuestionStats;

  return {
    total: data.total,
    withChapter: data.with_chapter,
    withoutChapter: data.without_chapter,
    byDifficulty: data.by_difficulty,
    byType: data.by_type,
  };
}
