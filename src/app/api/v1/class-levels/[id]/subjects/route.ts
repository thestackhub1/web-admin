/**
 * GET /api/v1/class-levels/[id]/subjects
 * POST /api/v1/class-levels/[id]/subjects
 * 
 * Get all subjects available for a specific class level or add a subject.
 * The [id] parameter can be either a UUID or a slug.
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { uuidParamSchema } from '@/lib/api/validators';
import { ClassLevelsService, SubjectsService } from '@/lib/services';
import { z } from 'zod';

type Params = { params: Promise<{ id: string }> };

const addSubjectSchema = z.object({
  subject_id: z.string().uuid(),
});

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

        // Get class level by ID or slug
        const classLevel = await getClassLevelByIdOrSlug(id);
        if (!classLevel) {
            return ApiErrors.notFound('Class level not found');
        }

        // Fetch subjects for this class level using service
        const subjects = await SubjectsService.getByClassLevel(classLevel.id);

        // Transform to snake_case for API response
        const data = subjects.map((s) => ({
            id: s.id,
            name_en: s.nameEn,
            name_mr: s.nameMr,
            slug: s.slug,
            description_en: s.descriptionEn,
            description_mr: s.descriptionMr,
            icon: s.icon,
            order_index: s.orderIndex,
            is_active: s.isActive,
        }));

        return successResponse(data);
    } catch (error) {
        console.error('[API] Subjects for class level error:', error);
        return ApiErrors.serverError('Failed to fetch subjects');
    }
}

export async function POST(request: NextRequest, context: Params) {
    try {
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        // Only admins can add subjects to class levels
        if (!['admin', 'super_admin'].includes(authResult.profile.role)) {
            return ApiErrors.forbidden('Only admins can add subjects to class levels');
        }

        const { id } = await context.params;

        // Get class level by ID or slug
        const classLevel = await getClassLevelByIdOrSlug(id);
        if (!classLevel) {
            return ApiErrors.notFound('Class level not found');
        }

        const body = await request.json();
        const parsed = addSubjectSchema.safeParse(body);

        if (!parsed.success) {
            return ApiErrors.validationError(parsed.error.issues[0].message);
        }

        // Validate subject ID
        const subjectIdResult = uuidParamSchema.safeParse(parsed.data.subject_id);
        if (!subjectIdResult.success) {
            return ApiErrors.badRequest('Invalid subject ID format');
        }

        const rlsContext = {
            userId: authResult.user.id,
            role: authResult.profile.role,
            email: authResult.user.email,
        };

        const result = await ClassLevelsService.addSubject(classLevel.id, parsed.data.subject_id, rlsContext);

        if (!result.success) {
            return ApiErrors.serverError('Failed to add subject to class level');
        }

        return successResponse({ success: true });
    } catch (error) {
        console.error('[API] Add subject to class level error:', error);
        return ApiErrors.serverError('Failed to add subject to class level');
    }
}

