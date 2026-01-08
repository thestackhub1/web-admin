/**
 * GET /api/v1/users/[id]
 * 
 * Get a single user by ID with their exam statistics.
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { UsersService, ExamsService, SchoolsService } from '@/lib/services';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Params) {
    try {
        // Authenticate - require admin role
        const authResult = await authenticateRequest(request, {
            allowedRoles: ['admin']
        });
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const { id } = await context.params;

        if (!id) {
            return ApiErrors.badRequest('User ID is required');
        }

        // Get user profile
        const user = await UsersService.getById(id, {
            userId: authResult.user.id,
            role: authResult.profile.role,
            email: authResult.user.email,
        });

        if (!user) {
            return ApiErrors.notFound('User not found');
        }

        // Get exam statistics using service
        const rlsContext = {
            userId: authResult.user.id,
            role: authResult.profile.role,
            email: authResult.user.email,
        };

        const examStats = await ExamsService.getUserExamStats(id, rlsContext);

        // Get school details if schoolId exists
        let schoolDetails = null;
        if (user.schoolId) {
            const school = await SchoolsService.getById(user.schoolId, rlsContext);
            if (school) {
                schoolDetails = {
                    id: school.id,
                    name: school.name,
                };
            }
        }

        // Transform user to snake_case
        const transformedUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            avatar_url: user.avatarUrl,
            school_id: user.schoolId,
            class_level: user.classLevel,
            role: user.role,
            preferred_language: user.preferredLanguage,
            is_active: user.isActive,
            created_at: user.createdAt?.toISOString(),
            updated_at: user.updatedAt?.toISOString(),
            schools: schoolDetails, // Include school info
        };

        // Transform to snake_case
        const transformed = {
            ...transformedUser,
            exam_stats: {
                total: examStats.total,
                completed: examStats.completed,
                passed: examStats.passed,
                avg_score: examStats.avgScore,
            },
            recent_exams: examStats.recentExams,
        };

        return successResponse(transformed);
    } catch (error) {
        console.error('[API] User by ID error:', error);
        return ApiErrors.serverError('Failed to fetch user');
    }
}

export async function PATCH(request: NextRequest, context: Params) {
    try {
        const authResult = await authenticateRequest(request, { allowedRoles: ['admin'] });
        if (!isAuthContext(authResult)) return authResult;

        const { id } = await context.params;
        if (!id) return ApiErrors.badRequest('User ID is required');

        const body = await request.json();

        // Update user via service
        const updatedUser = await UsersService.update(id, {
            name: body.name,
            role: body.role,
            schoolId: body.schoolId,
            classLevel: body.classLevel,
            isActive: body.isActive,
            email: body.email,
            password: body.password, // Optional password reset
        });

        return successResponse(updatedUser);
    } catch (error: any) {
        console.error('[API] Update User error:', error);
        return ApiErrors.serverError(error.message || 'Failed to update user');
    }
}

export async function DELETE(request: NextRequest, context: Params) {
    try {
        const authResult = await authenticateRequest(request, { allowedRoles: ['admin'] });
        if (!isAuthContext(authResult)) return authResult;

        const { id } = await context.params;
        if (!id) return ApiErrors.badRequest('User ID is required');

        const { searchParams } = new URL(request.url);
        const hardDelete = searchParams.get('hardDelete') === 'true';

        await UsersService.delete(id, hardDelete);

        return successResponse({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
        console.error('[API] Delete User error:', error);
        return ApiErrors.serverError(error.message || 'Failed to delete user');
    }
}

