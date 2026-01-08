/**
 * Server-Side API Client
 *
 * Centralized fetch wrapper for making API calls from server components.
 * Handles authentication, error handling, and type safety.
 *
 * @example
 * ```tsx
 * // In a server component
 * const { data } = await serverApi.get<User[]>('/api/v1/users');
 * ```
 */

import type { ApiSuccessResponse, ApiErrorResponse } from "@/client/types/api";

// ============================================================
// Types
// ============================================================

export interface FetchOptions extends Omit<RequestInit, "body"> {
    body?: Record<string, unknown> | unknown[];
}

export interface ApiResult<T> {
    data: T | null;
    error: string | null;
    status: number;
}

// ============================================================
// Server-Side API (for use in server components)
// ============================================================

/**
 * Server-side fetch that needs absolute URL
 */
async function serverFetcher<T>(
    path: string,
    method: string = "GET",
    body?: Record<string, unknown> | unknown[],
    options: FetchOptions = {}
): Promise<ApiResult<T>> {
    // Get the base URL from environment
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const url = path.startsWith("http") ? path : `${baseUrl}${path}`;

    try {
        const { body: _optionsBody, ...restOptions } = options;

        const config: RequestInit = {
            method,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers as Record<string, string> || {}),
            },
            cache: "no-store", // Don't cache in server components
            ...restOptions,
        };

        if (body && method !== "GET") {
            config.body = JSON.stringify(body);
        }

        const response = await fetch(url, config);

        // Handle empty responses
        const text = await response.text();
        if (!text) {
            if (!response.ok) {
                return {
                    data: null,
                    error: `HTTP ${response.status}`,
                    status: response.status,
                };
            }
            return {
                data: null,
                error: null,
                status: response.status,
            };
        }

        const result = JSON.parse(text);

        if (!response.ok) {
            const errorResponse = result as ApiErrorResponse;
            return {
                data: null,
                error: errorResponse.error || `HTTP ${response.status}`,
                status: response.status,
            };
        }

        // Handle standard API response format
        if (result && typeof result === "object" && "success" in result) {
            if (result.success === true) {
                const successResponse = result as ApiSuccessResponse<T>;
                return {
                    data: successResponse.data,
                    error: null,
                    status: response.status,
                };
            } else {
                const errorResponse = result as ApiErrorResponse;
                return {
                    data: null,
                    error: errorResponse.error || "Unknown error",
                    status: response.status,
                };
            }
        }

        // Handle raw response (not wrapped in ApiResponse)
        return {
            data: result as T,
            error: null,
            status: response.status,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Network error";
        return {
            data: null,
            error: message,
            status: 0,
        };
    }
}

/**
 * Server-side API object for use in server components
 */
export const serverApi = {
    get: <T>(path: string, options?: FetchOptions) =>
        serverFetcher<T>(path, "GET", undefined, options),

    post: <T>(path: string, body?: Record<string, unknown> | unknown[], options?: FetchOptions) =>
        serverFetcher<T>(path, "POST", body, options),

    put: <T>(path: string, body?: Record<string, unknown> | unknown[], options?: FetchOptions) =>
        serverFetcher<T>(path, "PUT", body, options),

    patch: <T>(path: string, body?: Record<string, unknown> | unknown[], options?: FetchOptions) =>
        serverFetcher<T>(path, "PATCH", body, options),

    delete: <T>(path: string, options?: FetchOptions) =>
        serverFetcher<T>(path, "DELETE", undefined, options),
};
