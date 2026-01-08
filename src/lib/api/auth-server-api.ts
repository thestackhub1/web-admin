/**
 * Authenticated Server API
 * 
 * Wrapper around serverApi that automatically handles authentication.
 * Use this in Server Components to make authenticated API calls without
 * manually handling tokens.
 * 
 * @example
 * ```tsx
 * // In a server component
 * const { data } = await authServerApi.get<User[]>('/api/v1/users');
 * ```
 */

import { serverApi, type FetchOptions, type ApiResult } from './api-client';
import { getSessionToken } from '@/lib/auth';

/**
 * Creates fetch options with authorization header
 */
async function withAuth(options?: FetchOptions): Promise<FetchOptions> {
  const token = await getSessionToken();
  
  if (!token) {
    return options || {};
  }

  return {
    ...options,
    headers: {
      ...((options?.headers as Record<string, string>) || {}),
      Authorization: `Bearer ${token}`,
    },
  };
}

/**
 * Authenticated server-side API object for use in server components.
 * Automatically adds authorization headers from the current session.
 */
export const authServerApi = {
  /**
   * Authenticated GET request
   */
  get: async <T>(path: string, options?: FetchOptions): Promise<ApiResult<T>> => {
    const authOptions = await withAuth(options);
    return serverApi.get<T>(path, authOptions);
  },

  /**
   * Authenticated POST request
   */
  post: async <T>(
    path: string,
    body?: Record<string, unknown> | unknown[],
    options?: FetchOptions
  ): Promise<ApiResult<T>> => {
    const authOptions = await withAuth(options);
    return serverApi.post<T>(path, body, authOptions);
  },

  /**
   * Authenticated PUT request
   */
  put: async <T>(
    path: string,
    body?: Record<string, unknown> | unknown[],
    options?: FetchOptions
  ): Promise<ApiResult<T>> => {
    const authOptions = await withAuth(options);
    return serverApi.put<T>(path, body, authOptions);
  },

  /**
   * Authenticated PATCH request
   */
  patch: async <T>(
    path: string,
    body?: Record<string, unknown> | unknown[],
    options?: FetchOptions
  ): Promise<ApiResult<T>> => {
    const authOptions = await withAuth(options);
    return serverApi.patch<T>(path, body, authOptions);
  },

  /**
   * Authenticated DELETE request
   */
  delete: async <T>(path: string, options?: FetchOptions): Promise<ApiResult<T>> => {
    const authOptions = await withAuth(options);
    return serverApi.delete<T>(path, authOptions);
  },
};

/**
 * Check if user is authenticated (has valid session token)
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getSessionToken();
  return !!token;
}
