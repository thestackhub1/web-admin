/**
 * GET /api/v1/class-levels/[id]
 * PATCH /api/v1/class-levels/[id]
 * DELETE /api/v1/class-levels/[id]
 * 
 * Get, update or delete a class level. The [id] parameter can be either a UUID or a slug.
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { uuidParamSchema, slugParamSchema } from '@/lib/api/validators';
import { ClassLevelsService, SubjectsService } from '@/lib/services';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// Helper to check if string is UUID
function isUUID(str: string): boolean {
    return uuidParamSchema.safeParse(str).success;
}

// Helper to get class level by ID or slug
async function getClassLevelByIdOrSlug(idOrSlug: string) {
    if (isUUID(idOrSlug)) {
        return await ClassLevelsService.getById(idOrSlug);
    } else {
        const slugResult = slugParamSchema.safeParse(idOrSlug);
        if (!slugResult.success) {
            return null;
        }
        return await ClassLevelsService.getBySlug(idOrSlug);
    }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const { id } = await params;

        const classLevel = await getClassLevelByIdOrSlug(id);
        if (!classLevel) {
            return ApiErrors.notFound('Class level not found');
        }

        // Fetch subjects for this class level
        const subjects = await SubjectsService.getByClassLevel(classLevel.id);

        // Transform to snake_case for API response
        const data = {
            id: classLevel.id,
            name_en: classLevel.nameEn,
            name_mr: classLevel.nameMr,
            slug: classLevel.slug,
            description_en: classLevel.descriptionEn,
            description_mr: classLevel.descriptionMr,
            order_index: classLevel.orderIndex,
            is_active: classLevel.isActive,
            subjects: subjects.map((s) => ({
                id: s.id,
                name_en: s.nameEn,
                name_mr: s.nameMr,
                slug: s.slug,
                description_en: s.descriptionEn,
                description_mr: s.descriptionMr,
                icon: s.icon,
                order_index: s.orderIndex,
            })),
        };

        return successResponse(data);
    } catch (error) {
        console.error('[API] Get class level error:', error);
        return ApiErrors.serverError('Failed to fetch class level');
    }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const authResult = await authenticateRequest(request, {
            requireStudent: false,
            allowedRoles: ['admin', 'super_admin']
        });
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        // Get class level to find actual ID if slug was provided
        const classLevel = await getClassLevelByIdOrSlug(id);
        if (!classLevel) {
            return ApiErrors.notFound('Class level not found');
        }

        const body = await request.json();

        const updated = await ClassLevelsService.update(classLevel.id, {
            nameEn: body.name_en,
            nameMr: body.name_mr,
            descriptionEn: body.description_en,
            descriptionMr: body.description_mr,
            orderIndex: body.order_index,
            slug: body.slug,
            isActive: body.is_active,
        });

        if (!updated) {
            return ApiErrors.notFound('Class level not found');
        }

        return successResponse(updated);
    } catch (error) {
        console.error('[API] Update class level error:', error);
        return ApiErrors.serverError('Failed to update class level');
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const authResult = await authenticateRequest(request, {
            requireStudent: false,
            allowedRoles: ['admin', 'super_admin']
        });
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        // Get class level to find actual ID if slug was provided
        const classLevel = await getClassLevelByIdOrSlug(id);
        if (!classLevel) {
            return ApiErrors.notFound('Class level not found');
        }

        const deleted = await ClassLevelsService.delete(classLevel.id);

        if (!deleted) {
            return ApiErrors.notFound('Class level not found');
        }

        return successResponse({ success: true, id: classLevel.id });
    } catch (error) {
        console.error('[API] Delete class level error:', error);
        return ApiErrors.serverError('Failed to delete class level');
    }
}
