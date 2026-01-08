/**
 * Rate Limiting Utility
 * 
 * Simple in-memory rate limiter for API endpoints.
 * For production, use Redis-based rate limiting.
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

// In-memory store (reset on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetAt) {
            rateLimitStore.delete(key);
        }
    }
}, 60000); // Clean up every minute

export interface RateLimitConfig {
    /** Maximum requests allowed in the window */
    maxRequests: number;
    /** Time window in seconds */
    windowSeconds: number;
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: number;
}

/**
 * Check if a request is rate limited
 * @param key - Unique identifier (e.g., IP + endpoint)
 * @param config - Rate limit configuration
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now();
    const windowMs = config.windowSeconds * 1000;
    const entry = rateLimitStore.get(key);

    // No existing entry or window expired
    if (!entry || now > entry.resetAt) {
        const resetAt = now + windowMs;
        rateLimitStore.set(key, { count: 1, resetAt });
        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetAt,
        };
    }

    // Within window
    if (entry.count >= config.maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetAt: entry.resetAt,
        };
    }

    // Increment and allow
    entry.count++;
    return {
        allowed: true,
        remaining: config.maxRequests - entry.count,
        resetAt: entry.resetAt,
    };
}

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
    // Check common proxy headers
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    
    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }

    // Fallback (won't work in production behind proxy)
    return 'unknown';
}

// Common rate limit configurations
export const RATE_LIMITS = {
    /** Auth endpoints: 5 requests per minute */
    auth: { maxRequests: 5, windowSeconds: 60 },
    /** Signin: 5 requests per minute (same as auth) */
    signin: { maxRequests: 5, windowSeconds: 60 },
    /** Signup: 3 requests per 5 minutes */
    signup: { maxRequests: 3, windowSeconds: 300 },
    /** General API: 100 requests per minute */
    api: { maxRequests: 100, windowSeconds: 60 },
    /** Exam start: 10 requests per minute */
    examStart: { maxRequests: 10, windowSeconds: 60 },
    /** Default fallback: 10 requests per minute */
    default: { maxRequests: 10, windowSeconds: 60 },
} as const;
