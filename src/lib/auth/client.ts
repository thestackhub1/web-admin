/**
 * Client-side Auth Utilities
 *
 * Handles authentication state and token management in the browser.
 * Replaces Supabase browser client.
 */

// Token storage keys
const ACCESS_TOKEN_KEY = "abhedya_access_token";
const REFRESH_TOKEN_KEY = "abhedya_refresh_token";

/**
 * Set a cookie
 */
function setCookie(name: string, value: string, days = 7): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

/**
 * Delete a cookie
 */
function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

/**
 * Store tokens in localStorage and cookies (for middleware)
 */
export function storeTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === "undefined") return;
  // Store in localStorage for client-side access
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  // Store in cookies for middleware (server-side) access
  setCookie(ACCESS_TOKEN_KEY, accessToken, 1); // Access token cookie expires in 1 day
  setCookie(REFRESH_TOKEN_KEY, refreshToken, 7); // Refresh token cookie expires in 7 days
}

/**
 * Get access token from localStorage (sync version)
 */
export function getAccessTokenSync(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Get access token from localStorage (async version for API compatibility)
 * This returns the token immediately, but is async for drop-in replacement of Supabase client
 */
export async function getAccessToken(): Promise<string | null> {
  return getAccessTokenSync();
}

/**
 * Get refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Clear tokens from localStorage and cookies (logout)
 */
export function clearTokens(): void {
  if (typeof window === "undefined") return;
  // Clear from localStorage
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  // Clear from cookies
  deleteCookie(ACCESS_TOKEN_KEY);
  deleteCookie(REFRESH_TOKEN_KEY);
}

/**
 * Check if user is authenticated (has access token)
 */
export function isAuthenticated(): boolean {
  return !!getAccessTokenSync();
}

/**
 * Parse JWT token to get payload (without verification)
 * Only use for display purposes, not for auth decisions
 */
export function parseToken(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Get current user info from token (without verification)
 */
export function getCurrentUser(): {
  id: string;
  email: string;
  role: string;
} | null {
  const token = getAccessTokenSync();
  if (!token) return null;

  const payload = parseToken(token);
  if (!payload) return null;

  return {
    id: payload.sub as string,
    email: payload.email as string,
    role: payload.role as string,
  };
}

/**
 * Check if token is expired (with 5 minute buffer)
 */
export function isTokenExpired(token?: string): boolean {
  const t = token || getAccessTokenSync();
  if (!t) return true;

  const payload = parseToken(t);
  if (!payload || !payload.exp) return true;

  const expiry = (payload.exp as number) * 1000;
  const buffer = 5 * 60 * 1000; // 5 minutes
  return Date.now() > expiry - buffer;
}

/**
 * Attempt to refresh the access token
 */
export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch("/api/v1/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const data = await response.json();
    if (data.accessToken && data.refreshToken) {
      storeTokens(data.accessToken, data.refreshToken);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Token refresh failed:", error);
    clearTokens();
    return false;
  }
}

/**
 * Get a valid access token (refresh if needed)
 */
export async function getValidAccessToken(): Promise<string | null> {
  const token = getAccessTokenSync();

  if (!token) return null;

  if (!isTokenExpired(token)) {
    return token;
  }

  // Try to refresh
  const refreshed = await refreshAccessToken();
  if (refreshed) {
    return getAccessTokenSync();
  }

  return null;
}
