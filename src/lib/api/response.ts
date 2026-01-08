/**
 * API Response Utilities
 * 
 * Standardized JSON response helpers for consistent API responses.
 */

import { NextResponse } from 'next/server';

export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
}

export interface ApiErrorResponse {
    success: false;
    error: string;
    code?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Security headers for all API responses
 */
const SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
};

/**
 * Return a successful JSON response
 */
export function successResponse<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
    return NextResponse.json(
        { success: true, data },
        { status, headers: SECURITY_HEADERS }
    );
}

/**
 * Return an error JSON response
 */
export function errorResponse(
    error: string,
    status = 400,
    code?: string
): NextResponse<ApiErrorResponse> {
    const response: ApiErrorResponse = { success: false, error };
    if (code) response.code = code;
    return NextResponse.json(response, { status, headers: SECURITY_HEADERS });
}

/**
 * Return a rate limit exceeded response
 */
export function rateLimitResponse(resetAt: number): NextResponse<ApiErrorResponse> {
    const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
    return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' },
        {
            status: 429,
            headers: {
                ...SECURITY_HEADERS,
                'Retry-After': String(retryAfter),
            },
        }
    );
}

/**
 * Common error responses
 */
export const ApiErrors = {
    unauthorized: (message = 'Unauthorized') => errorResponse(message, 401, 'UNAUTHORIZED'),
    forbidden: (message = 'Forbidden') => errorResponse(message, 403, 'FORBIDDEN'),
    notFound: (message = 'Not found') => errorResponse(message, 404, 'NOT_FOUND'),
    badRequest: (message: string) => errorResponse(message, 400, 'BAD_REQUEST'),
    validationError: (message: string) => errorResponse(message, 400, 'VALIDATION_ERROR'),
    conflict: (message = 'Conflict') => errorResponse(message, 409, 'CONFLICT'),
    serverError: (message = 'Internal server error') => errorResponse(message, 500, 'SERVER_ERROR'),
    rateLimited: (resetAt: number) => rateLimitResponse(resetAt),
};
