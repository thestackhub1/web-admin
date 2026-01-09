/**
 * Class Levels Client Service
 * 
 * Server-side data fetching for class levels via API routes.
 */

import { authServerApi, isAuthenticated } from "@/lib/api";

export interface ClassLevel {
  id: string;
  name_en: string;
  name_mr: string | null;
  slug: string;
  description_en: string | null;
  description_mr: string | null;
  order_index: number;
  subjects?: any[];
  exam_count?: number;
}

/**
 * Fetch all class levels
 */
export async function getClassLevels(): Promise<ClassLevel[]> {
  if (!(await isAuthenticated())) return [];

  const { data, error } = await authServerApi.get<ClassLevel[]>(
    `/api/v1/class-levels`
  );

  if (error || !data) {
    console.error("[ClassLevels] Error:", error);
    return [];
  }

  return data;
}
