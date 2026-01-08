/**
 * GET /api/v1/class-levels/[id]/scheduled-exams
 * 
 * Get all published scheduled exams for a specific class level.
 * Query params: subject_id
 * The [id] parameter can be either a UUID or a slug.
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { uuidParamSchema } from '@/lib/api/validators';
import { ClassLevelsService, ScheduledExamsService } from '@/lib/services';

type Params = { params: Promise<{ id: string }> };

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

export async function GET(request: NextRequest, context: Params) {
    try {
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const { id } = await context.params;
        const url = new URL(request.url);
        const subjectId = url.searchParams.get('subject_id') || undefined;

        // Validate subject_id if provided
        if (subjectId) {
            const subjectIdResult = uuidParamSchema.safeParse(subjectId);
            if (!subjectIdResult.success) {
                return ApiErrors.badRequest('Invalid subject ID format');
            }
        }

        // Fetch class level by ID or slug
        const classLevel = await getClassLevelByIdOrSlug(id);
        if (!classLevel) {
            return ApiErrors.notFound('Class level not found');
        }

        // Use service to fetch scheduled exams
        const exams = await ScheduledExamsService.getByClassLevel(
            classLevel.id,
            { subjectId },
            {
                userId: authResult.user.id,
                role: authResult.profile.role,
                email: authResult.user.email,
            }
        );

        return successResponse(exams);
    } catch (error) {
        console.error('[API] Scheduled exams for class level error:', error);
        return ApiErrors.serverError('Failed to fetch scheduled exams');
    }
}

