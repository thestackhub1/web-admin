/**
 * API Response Types
 *
 * Standardized types for API responses throughout the application.
 */

/**
 * Generic API response wrapper for successful responses
 */
export interface ApiSuccessResponse<T = unknown> {
    success: true;
    data: T;
    message?: string;
}

/**
 * API error response with error details
 */
export interface ApiErrorResponse {
    success: false;
    error: string;
    code?: ApiErrorCode;
    details?: Record<string, unknown>;
}

/**
 * Unified API response type
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Standard error codes for API responses
 */
export type ApiErrorCode =
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "VALIDATION_ERROR"
    | "RATE_LIMITED"
    | "INTERNAL_ERROR"
    | "BAD_REQUEST"
    | "CONFLICT";

/**
 * Pagination metadata for list responses
 */
export interface PaginationMeta {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
    items: T[];
    pagination: PaginationMeta;
}

/**
 * Standard list query parameters
 */
export interface ListQueryParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    search?: string;
}

/**
 * Type guard to check if response is successful
 */
export function isApiSuccess<T>(
    response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
    return response.success === true;
}

/**
 * Type guard to check if response is an error
 */
export function isApiError(
    response: ApiResponse<unknown>
): response is ApiErrorResponse {
    return response.success === false;
}
