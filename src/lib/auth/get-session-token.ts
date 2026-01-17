/**
 * Get Session Token Helper
 * 
 * Utility function to get the access token from the current session.
 * Used by server components to authenticate API calls.
 */

import { headers } from "next/headers";
import { extractBearerToken } from "./jwt";

/**
 * Get the access token from the current request
 * @returns The access token or null if not authenticated
 */
export async function getSessionToken(): Promise<string | null> {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");
  return extractBearerToken(authHeader);
}


