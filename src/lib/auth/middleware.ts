/**
 * API Authentication Middleware
 * 
 * Verifies JWT tokens and enforces role-based access control for API routes.
 */

import { NextRequest } from 'next/server';
import { getSupabaseAdmin, verifyToken } from '../api/supabase-admin';
import { ApiErrors } from '../api/response';

export interface AuthUser {
    id: string;
    email: string;
}

export interface AuthProfile {
    id: string;
    email: string;
    name: string | null;
    role: string;
    preferred_language: string;
    is_active: boolean;
}

export interface AuthContext {
    user: AuthUser;
    profile: AuthProfile;
}

/**
 * Extract token from Authorization header
 */
function extractToken(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.slice(7);
}

/**
 * Authenticate request and return user context
 * Returns error response if authentication fails
 * 
 * Options:
 * - requireStudent: If true, only 'student' role allowed (default: false for admin portal)
 * - allowedRoles: Array of allowed roles (overrides requireStudent if provided)
 */
export async function authenticateRequest(
    request: NextRequest,
    options: {
        requireStudent?: boolean;
        allowedRoles?: ('admin' | 'teacher' | 'student' | 'super_admin')[];
    } = { requireStudent: false }
): Promise<AuthContext | ReturnType<typeof ApiErrors.unauthorized>> {
    // Extract token
    const token = extractToken(request);
    if (!token) {
        return ApiErrors.unauthorized('Missing authorization token');
    }

    // Verify token
    const user = await verifyToken(token);
    if (!user) {
        return ApiErrors.unauthorized('Invalid or expired token');
    }

    // Fetch profile
    const supabase = getSupabaseAdmin();
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, name, role, preferred_language, is_active')
        .eq('id', user.id)
        .single();

    if (profileError || !profile) {
        return ApiErrors.unauthorized('Profile not found');
    }

    // Check if account is active
    if (!profile.is_active) {
        return ApiErrors.forbidden('Account is deactivated');
    }

    // Role-based access control
    if (options.allowedRoles) {
        // Use allowedRoles if provided
        if (!options.allowedRoles.includes(profile.role as 'admin' | 'teacher' | 'student' | 'super_admin')) {
            return ApiErrors.forbidden(`This action requires one of: ${options.allowedRoles.join(', ')}`);
        }
    } else if (options.requireStudent && profile.role !== 'student') {
        // Legacy: check student role
        return ApiErrors.forbidden('This API is for students only');
    }

    return {
        user: { id: user.id, email: user.email || '' },
        profile: profile as AuthProfile,
    };
}

/**
 * Type guard to check if result is an auth context
 */
export function isAuthContext(
    result: AuthContext | ReturnType<typeof ApiErrors.unauthorized>
): result is AuthContext {
    return 'user' in result && 'profile' in result;
}


