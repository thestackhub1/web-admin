// Client-side only — no server secrets or database access here

/**
 * API Client
 *
 * Centralized fetch wrapper for making API calls from client components.
 * Handles authentication, error handling, and type safety.
 *
 * @example
 * ```tsx
 * // In a client component
 * const { data, error } = await api.get<Subject[]>('/api/v1/subjects');
 * ```
 */

import type { ApiSuccessResponse, ApiErrorResponse } from "@/client/types/api";
import { getAccessToken } from "@/lib/auth/client";

// ============================================================
// Types
// ============================================================

export interface FetchOptions extends Omit<RequestInit, "body"> {
    body?: Record<string, unknown> | unknown[] | object;
    skipAuth?: boolean; // Skip adding auth header (for public endpoints)
}

export interface ApiResult<T> {
    data: T | null;
    error: string | null;
    status: number;
}

// ============================================================
// Client-Side API (for use in client components)
// ============================================================

/**
 * Base fetch function with error handling and automatic auth
 */
async function fetcher<T>(
    url: string,
    method: string = "GET",
    body?: Record<string, unknown> | unknown[] | object,
    options: FetchOptions = {}
): Promise<ApiResult<T>> {
    try {
        const { body: _optionsBody, skipAuth, ...restOptions } = options;

        // Get auth token for authenticated requests
        let authHeader: Record<string, string> = {};
        if (!skipAuth) {
            const token = await getAccessToken();
            if (token) {
                authHeader = { Authorization: `Bearer ${token}` };
            }
        }

        const config: RequestInit = {
            method,
            headers: {
                "Content-Type": "application/json",
                ...authHeader,
                ...(options.headers as Record<string, string> || {}),
            },
            credentials: "include", // Include cookies for auth
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

        // Try to parse JSON
        let result: unknown;
        try {
            result = JSON.parse(text);
        } catch (_e) {
            // If parsing fails, it's likely an HTML error page (404, 500)
            console.error("[API Client] JSON parse error. URL:", url);
            console.error("[API Client] Response status:", response.status);
            console.error("[API Client] Response headers:", Object.fromEntries(response.headers.entries()));
            console.error("[API Client] Raw text (first 200 chars):", text.slice(0, 200));
            
            // Check if it's a 404 - the route might not exist
            if (response.status === 404) {
                return {
                    data: null,
                    error: `API endpoint not found: ${url}. Please check the route configuration.`,
                    status: response.status,
                };
            }
            
            return {
                data: null,
                error: `Server returned invalid response (${response.status}). Expected JSON but received HTML.`,
                status: response.status,
            };
        }

        if (!response.ok) {
            const errorResponse = result as ApiErrorResponse;
            return {
                data: null,
                error: errorResponse.error || `HTTP ${response.status}`,
                status: response.status,
            };
        }

        // Handle standard API response format
        if (result && typeof result === "object" && result !== null && "success" in result) {
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
        // Handle network errors, JSON parsing errors, etc.
        let message = "Network error";
        if (error instanceof TypeError && error.message.includes("fetch")) {
            message = "Failed to connect to server. Please check your connection.";
        } else if (error instanceof SyntaxError) {
            message = "Invalid response from server";
        } else if (error instanceof Error) {
            message = error.message;
        }
        console.error("[API Client] Fetch error:", error);
        return {
            data: null,
            error: message,
            status: 0,
        };
    }
}

/**
 * Client-side API object for use in client components
 */
export const api = {
    /**
     * GET request
     */
    get: <T>(url: string, options?: FetchOptions) =>
        fetcher<T>(url, "GET", undefined, options),

    /**
     * POST request
     */
    post: <T>(url: string, body?: Record<string, unknown> | unknown[] | object, options?: FetchOptions) =>
        fetcher<T>(url, "POST", body, options),

    /**
     * PUT request
     */
    put: <T>(url: string, body?: Record<string, unknown> | unknown[] | object, options?: FetchOptions) =>
        fetcher<T>(url, "PUT", body, options),

    /**
     * PATCH request
     */
    patch: <T>(url: string, body?: Record<string, unknown> | unknown[] | object, options?: FetchOptions) =>
        fetcher<T>(url, "PATCH", body, options),

    /**
     * DELETE request
     */
    delete: <T>(url: string, options?: FetchOptions) =>
        fetcher<T>(url, "DELETE", undefined, options),
};

export default api;
