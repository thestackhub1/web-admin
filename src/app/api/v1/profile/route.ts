/**
 * GET /api/v1/profile
 * PUT /api/v1/profile
 * 
 * Get or update the authenticated user's profile.
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { ProfileService } from '@/lib/services';
import { updateProfileSchema } from '@/lib/api/validators';


/**
 * GET - Get current user's profile with stats
 */
export async function GET(request: NextRequest) {
    try {
        // Allow all authenticated users to view their profile
        const authResult = await authenticateRequest(request, { requireStudent: false });
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        console.log('[API] GET /profile - User ID:', authResult.user.id, 'Email:', authResult.user.email, 'Role:', authResult.profile.role);

        // Use service to fetch profile
        const profile = await ProfileService.getProfile(
            authResult.user.id,
            {
                userId: authResult.user.id,
                role: authResult.profile.role,
                email: authResult.user.email,
            }
        );

        if (!profile) {
            return ApiErrors.notFound('Profile not found');
        }

        return successResponse(profile);
    } catch (error) {
        console.error('[API] Get profile error:', error);
        return ApiErrors.serverError('Failed to fetch profile');
    }
}

/**
 * PUT - Update current user's profile
 */
export async function PUT(request: NextRequest) {
    try {
        // Allow all authenticated users to update their profile
        const authResult = await authenticateRequest(request, { requireStudent: false });
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const body = await request.json();

        // Validate input
        const parsed = updateProfileSchema.safeParse(body);
        if (!parsed.success) {
            return ApiErrors.validationError(parsed.error.issues[0].message);
        }

        const updates = parsed.data;
        if (Object.keys(updates).length === 0) {
            return ApiErrors.validationError('No fields to update');
        }

        // Use service to update profile
        const profile = await ProfileService.updateProfile(
            authResult.user.id,
            updates,
            {
                userId: authResult.user.id,
                role: authResult.profile.role,
                email: authResult.user.email,
            }
        );

        if (!profile) {
            console.error('[API] Update profile error: Profile not found');
            return ApiErrors.serverError('Failed to update profile');
        }

        return successResponse(profile);
    } catch (error) {
        console.error('[API] Update profile error:', error);
        return ApiErrors.serverError('Failed to update profile');
    }
}
