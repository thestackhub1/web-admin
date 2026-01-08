import { authServerApi, isAuthenticated } from "@/lib/api";

export interface SubjectListItem {
  id: string;
  name_en: string;
  name_mr?: string | null;
  slug: string;
}

export interface SubjectWithStats extends SubjectListItem {
  question_count?: number;
  chapter_count?: number;
}

export interface SubjectWithParent extends SubjectListItem {
  parent_id: string | null;
  is_category: boolean;
  parent?: {
    id: string;
    name_en: string;
    slug: string;
    is_category: boolean;
  } | null;
}

export interface ChildSubject {
  id: string;
  name_en: string;
  name_mr: string;
  slug: string;
  is_category: boolean;
  is_active: boolean;
}

/**
 * Fetch all subjects (simple list)
 */
export async function getSubjects(): Promise<SubjectListItem[]> {
  if (!(await isAuthenticated())) return [];

  const { data, error } = await authServerApi.get<SubjectListItem[]>("/api/v1/subjects");

  if (error || !data) {
    console.error("Failed to fetch subjects:", error);
    return [];
  }

  return data;
}

/**
 * Fetch subjects with question/chapter stats
 */
export async function getSubjectsWithStats(): Promise<SubjectWithStats[]> {
  if (!(await isAuthenticated())) return [];

  const { data, error } = await authServerApi.get<SubjectWithStats[]>("/api/v1/subjects?include_stats=true");

  if (error || !data) {
    console.error("Failed to fetch subjects with stats:", error);
    return [];
  }

  return data;
}

/**
 * Fetch a subject by slug with parent info
 */
export async function getSubjectBySlug(slug: string): Promise<SubjectWithParent | null> {
  if (!(await isAuthenticated())) return null;

  const { data, error } = await authServerApi.get<SubjectWithParent>(`/api/v1/subjects/${slug}?include_parent=true`);

  if (error || !data) {
    console.error("Failed to fetch subject:", error);
    return null;
  }

  return data;
}

/**
 * Fetch a subject with parent info (alias)
 */
export async function getSubjectWithParent(slug: string): Promise<SubjectWithParent | null> {
  return getSubjectBySlug(slug);
}

/**
 * Fetch child subjects for a category
 */
export async function getChildSubjects(categoryId: string): Promise<ChildSubject[]> {
  if (!(await isAuthenticated())) return [];

  const { data, error } = await authServerApi.get<ChildSubject[]>(`/api/v1/subjects?parent_id=${categoryId}`);

  if (error || !data) {
    console.error("Failed to fetch child subjects:", error);
    return [];
  }

  return data;
}

export interface SubjectWithClassCounts {
  id: string;
  name_en: string;
  name_mr: string | null;
  slug: string;
  is_active: boolean;
  subject_class_mappings: Array<{ count: number }>;
}

/**
 * Fetch subjects with class level counts
 */
export async function getSubjectsWithClassCounts(): Promise<SubjectWithClassCounts[]> {
  if (!(await isAuthenticated())) return [];

  const { data, error } = await authServerApi.get<SubjectWithClassCounts[]>(
    "/api/v1/subjects/with-class-counts"
  );

  if (error || !data) {
    console.error("Failed to fetch subjects with class counts:", error);
    return [];
  }

  return data;
}
