/**
 * DELETE /api/v1/class-levels/[id]/subjects/[subjectId]
 * 
 * Remove a subject from a class level.
 * The [id] parameter can be either a UUID or a slug.
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { uuidParamSchema } from '@/lib/api/validators';
import { ClassLevelsService } from '@/lib/services';

type Params = { params: Promise<{ id: string; subjectId: string }> };

// Helper to check if string is UUID
function isUUID(str: string): boolean {
    return uuidParamSchema.safeParse(str).success;
}

// Helper to get class level by ID or slug
async function getClassLevelByIdOrSlug(idOrSlug: string) {
    if (isUUID(idOrSlug)) {
        return await ClassLevelsService.getById(idOrSlug);
    } else {
        return await ClassLevelsService.getBySlug(idOrSlug);
    }
}

export async function DELETE(request: NextRequest, context: Params) {
    try {
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        // Only admins can remove subjects from class levels
        if (!['admin', 'super_admin'].includes(authResult.profile.role)) {
            return ApiErrors.forbidden('Only admins can remove subjects from class levels');
        }

        const { id, subjectId } = await context.params;

        // Validate subject ID
        const subjectIdResult = uuidParamSchema.safeParse(subjectId);
        if (!subjectIdResult.success) {
            return ApiErrors.badRequest('Invalid subject ID format');
        }

        // Get class level by ID or slug
        const classLevel = await getClassLevelByIdOrSlug(id);
        if (!classLevel) {
            return ApiErrors.notFound('Class level not found');
        }

        const rlsContext = {
            userId: authResult.user.id,
            role: authResult.profile.role,
            email: authResult.user.email,
        };

        const result = await ClassLevelsService.removeSubject(classLevel.id, subjectId, rlsContext);

        if (!result.success) {
            return ApiErrors.serverError('Failed to remove subject from class level');
        }

        return successResponse({ success: true });
    } catch (error) {
        console.error('[API] Remove subject from class level error:', error);
        return ApiErrors.serverError('Failed to remove subject from class level');
    }
}

