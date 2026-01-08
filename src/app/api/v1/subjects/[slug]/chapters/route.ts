/**
 * GET /api/v1/subjects/:slug/chapters
 * 
 * Get active chapters for a subject.
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { ChaptersService } from '@/lib/services';

interface RouteParams {
    params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const { slug } = await params;

        // Use service layer
        const chapters = await ChaptersService.getBySubjectSlug(slug);

        // Transform to snake_case for API response
        const data = chapters.map((ch) => ({
            id: ch.id,
            name_en: ch.nameEn,
            name_mr: ch.nameMr,
            description_en: ch.descriptionEn,
            description_mr: ch.descriptionMr,
            order_index: ch.orderIndex,
        }));

        return successResponse(data);
    } catch (error) {
        console.error('[API] Chapters error:', error);
        return ApiErrors.serverError('Failed to fetch chapters');
    }
}

/**
 * POST /api/v1/subjects/:slug/chapters
 * 
 * Create a new chapter for a subject.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        // Only admins and teachers can create chapters
        if (!['admin', 'teacher'].includes(authResult.profile.role)) {
            return ApiErrors.forbidden('Only admins and teachers can create chapters');
        }

        const { slug } = await params;

        // Parse request body
        const body = await request.json();
        const { name_en, name_mr, description_en, description_mr, order_index } = body;

        if (!name_en || !name_mr) {
            return ApiErrors.badRequest('Chapter names (English and Marathi) are required');
        }

        // Get subject ID from slug
        const { SubjectsService } = await import('@/lib/services');
        const subject = await SubjectsService.getBySlug(slug);


        if (!subject) {
            return ApiErrors.notFound('Subject not found');
        }

        // Create chapter
        const chapter = await ChaptersService.create({
            subjectId: subject.id,
            nameEn: name_en,
            nameMr: name_mr,
            descriptionEn: description_en,
            descriptionMr: description_mr,
            orderIndex: order_index,
        }, {
            userId: authResult.user.id,
            role: authResult.profile.role,
            email: authResult.user.email,
        });

        // Transform response
        const data = {
            id: chapter.id,
            name_en: chapter.nameEn,
            name_mr: chapter.nameMr,
            description_en: chapter.descriptionEn,
            description_mr: chapter.descriptionMr,
            order_index: chapter.orderIndex,
            subject_id: chapter.subjectId,
        };

        return successResponse(data, 201);
    } catch (error) {
        console.error('[API] Create chapter error:', error);
        return ApiErrors.serverError('Failed to create chapter');
    }
}
