/**
 * GET /api/v1/chapters/[id]
 *
 * Get a single chapter by ID with subject information.
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { ChaptersService, SubjectsService } from '@/lib/services';
import { z } from 'zod';

type Params = { params: Promise<{ id: string }> };

const uuidSchema = z.string().uuid('Invalid chapter ID format');

export async function GET(request: NextRequest, context: Params) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const { id } = await context.params;

        const uuidResult = uuidSchema.safeParse(id);
        if (!uuidResult.success) {
            return ApiErrors.badRequest('Invalid chapter ID format');
        }

        const rlsContext = {
            userId: authResult.user.id,
            role: authResult.profile.role,
            email: authResult.user.email,
        };

        // Get chapter
        const chapter = await ChaptersService.getById(id, rlsContext);

        if (!chapter) {
            return ApiErrors.notFound('Chapter not found');
        }

        // Get subject information
        const subject = await SubjectsService.getById(chapter.subjectId, rlsContext);

        // Transform to snake_case
        const transformed = {
            id: chapter.id,
            name_en: chapter.nameEn,
            name_mr: chapter.nameMr,
            description_en: chapter.descriptionEn,
            description_mr: chapter.descriptionMr,
            order_index: chapter.orderIndex,
            subject_id: chapter.subjectId,
            subjects: subject ? {
                id: subject.id,
                name_en: subject.nameEn,
                name_mr: subject.nameMr,
                slug: subject.slug,
                parent_subject_id: subject.parentSubjectId,
            } : null,
        };

        return successResponse(transformed);
    } catch (error) {
        console.error('[API] Chapter by ID error:', error);
        return ApiErrors.serverError('Failed to fetch chapter');
    }
}

/**
 * PATCH /api/v1/chapters/[id]
 *
 * Update a chapter.
 */
export async function PATCH(request: NextRequest, context: Params) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        // Only admins and teachers can update chapters
        if (!['admin', 'teacher'].includes(authResult.profile.role)) {
            return ApiErrors.forbidden('Only admins and teachers can update chapters');
        }

        const { id } = await context.params;

        const uuidResult = uuidSchema.safeParse(id);
        if (!uuidResult.success) {
            return ApiErrors.badRequest('Invalid chapter ID format');
        }

        const rlsContext = {
            userId: authResult.user.id,
            role: authResult.profile.role,
            email: authResult.user.email,
        };

        // Parse request body
        const body = await request.json();
        const { name_en, name_mr, description_en, description_mr, order_index, is_active } = body;

        // Update chapter
        const chapter = await ChaptersService.update(id, {
            nameEn: name_en,
            nameMr: name_mr,
            descriptionEn: description_en,
            descriptionMr: description_mr,
            orderIndex: order_index,
            isActive: is_active,
        }, rlsContext);

        if (!chapter) {
            return ApiErrors.notFound('Chapter not found');
        }

        // Transform response
        const data = {
            id: chapter.id,
            name_en: chapter.nameEn,
            name_mr: chapter.nameMr,
            description_en: chapter.descriptionEn,
            description_mr: chapter.descriptionMr,
            order_index: chapter.orderIndex,
            is_active: chapter.isActive,
        };

        return successResponse(data);
    } catch (error) {
        console.error('[API] Update chapter error:', error);
        return ApiErrors.serverError('Failed to update chapter');
    }
}

/**
 * DELETE /api/v1/chapters/[id]
 *
 * Delete a chapter (soft delete).
 */
export async function DELETE(request: NextRequest, context: Params) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        // Only admins and teachers can delete chapters
        if (!['admin', 'teacher'].includes(authResult.profile.role)) {
            return ApiErrors.forbidden('Only admins and teachers can delete chapters');
        }

        const { id } = await context.params;

        const uuidResult = uuidSchema.safeParse(id);
        if (!uuidResult.success) {
            return ApiErrors.badRequest('Invalid chapter ID format');
        }

        const rlsContext = {
            userId: authResult.user.id,
            role: authResult.profile.role,
            email: authResult.user.email,
        };

        // Delete chapter (soft delete)
        const chapter = await ChaptersService.delete(id, rlsContext);

        if (!chapter) {
            return ApiErrors.notFound('Chapter not found');
        }

        return successResponse({ success: true, message: 'Chapter deleted successfully' });
    } catch (error) {
        console.error('[API] Delete chapter error:', error);
        return ApiErrors.serverError('Failed to delete chapter');
    }
}

