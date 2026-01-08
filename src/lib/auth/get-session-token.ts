/**
 * Get Session Token Helper
 * 
 * Utility function to get the access token from the current session.
 * Used by server components to authenticate API calls.
 */

import { createClient } from "@/lib/supabase/server";

/**
 * Get the access token from the current session
 * @returns The access token or null if not authenticated
 */
export async function getSessionToken(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token || null;
}


