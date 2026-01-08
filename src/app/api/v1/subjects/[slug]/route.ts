/**
 * GET /api/v1/subjects/[slug]
 * PUT /api/v1/subjects/[slug]
 * 
 * Get or update a single subject by slug or ID.
 * The route accepts both slug (e.g., "mathematics") and UUID.
 * If subject is a category (is_category=true), includes nested sub_subjects.
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { SubjectsService } from '@/lib/services';

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, context: Params) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const { slug } = await context.params;

        if (!slug) {
            return ApiErrors.badRequest('Subject slug or ID is required');
        }

        // Check if slug is UUID or actual slug
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        let subject;

        if (uuidPattern.test(slug)) {
            // It's a UUID, get by ID
            subject = await SubjectsService.getById(slug);
        } else {
            // It's a slug, get by slug
            subject = await SubjectsService.getBySlug(slug);
        }

        if (!subject) {
            return ApiErrors.notFound('Subject not found');
        }

        // Transform to snake_case for API response
        const transformSubject = (s: any): any => ({
            id: s.id,
            name_en: s.nameEn,
            name_mr: s.nameMr,
            slug: s.slug,
            description_en: s.descriptionEn,
            description_mr: s.descriptionMr,
            icon: s.icon,
            order_index: s.orderIndex,
            is_active: s.isActive,
            is_category: s.isCategory,
            parent_subject_id: s.parentSubjectId,
            is_paper: s.isPaper,
            paper_number: s.paperNumber,
            sub_subjects: s.sub_subjects?.map((sub: any) => ({
                id: sub.id,
                name_en: sub.nameEn,
                name_mr: sub.nameMr,
                slug: sub.slug,
                description_en: sub.descriptionEn,
                description_mr: sub.descriptionMr,
                icon: sub.icon,
                order_index: sub.orderIndex,
                is_active: sub.isActive,
                is_category: sub.isCategory,
                parent_subject_id: sub.parentSubjectId,
            })) || [],
        });

        return successResponse(transformSubject(subject));
    } catch (error) {
        console.error('[API] Subject by slug/ID error:', error);
        return ApiErrors.serverError('Failed to fetch subject');
    }
}

export async function PUT(request: NextRequest, context: Params) {
    try {
        // Authenticate - only admins can update subjects
        const authResult = await authenticateRequest(request, { allowedRoles: ['admin', 'super_admin'] });
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const { slug } = await context.params;

        if (!slug) {
            return ApiErrors.badRequest('Subject slug or ID is required');
        }

        const body = await request.json();
        const { name_en, name_mr, description_en, description_mr, icon, order_index, is_active } = body;

        // Validate required fields
        if (!name_en || !name_mr) {
            return ApiErrors.badRequest('name_en and name_mr are required');
        }

        // Check if slug is UUID or actual slug
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        let subjectId = slug;

        if (!uuidPattern.test(slug)) {
            // It's a slug, get subject first to get ID
            const subject = await SubjectsService.getBySlug(slug);
            if (!subject) {
                return ApiErrors.notFound('Subject not found');
            }
            subjectId = subject.id;
        }

        // Use service layer
        const result = await SubjectsService.update(
            subjectId,
            {
                nameEn: name_en,
                nameMr: name_mr,
                descriptionEn: description_en ?? null,
                descriptionMr: description_mr ?? null,
                icon: icon ?? null,
                orderIndex: order_index ?? undefined,
                isActive: is_active ?? undefined,
            },
            {
                userId: authResult.user.id,
                role: authResult.profile.role,
                email: authResult.user.email,
            }
        );

        if (!result.success) {
            return ApiErrors.badRequest(result.error || 'Failed to update subject');
        }

        // Transform to snake_case for API response
        const transformed = {
            id: result.data!.id,
            name_en: result.data!.nameEn,
            name_mr: result.data!.nameMr,
            slug: result.data!.slug,
            description_en: result.data!.descriptionEn,
            description_mr: result.data!.descriptionMr,
            icon: result.data!.icon,
            order_index: result.data!.orderIndex,
            is_active: result.data!.isActive,
            is_category: result.data!.isCategory,
            parent_subject_id: result.data!.parentSubjectId,
            is_paper: result.data!.isPaper,
            paper_number: result.data!.paperNumber,
        };

        return successResponse(transformed);
    } catch (error) {
        console.error('[API] Update subject error:', error);
        return ApiErrors.serverError('Failed to update subject');
    }
}
