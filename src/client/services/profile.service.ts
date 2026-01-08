import { authServerApi, isAuthenticated } from "@/lib/api";

export interface ProfileData {
  id: string;
  email: string;
  name?: string | null;
  display_name?: string;
  role: string;
  avatar_url: string | null;
  school_id?: string | null;
  preferred_language?: string | null;
}

/**
 * Get current user profile
 */
export async function getProfile(): Promise<ProfileData | null> {
  if (!(await isAuthenticated())) return null;

  const { data } = await authServerApi.get<ProfileData>("/api/v1/profile");

  return data || null;
}
