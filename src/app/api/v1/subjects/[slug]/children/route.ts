/**
 * POST /api/v1/subjects/[slug]/children
 * GET /api/v1/subjects/[slug]/children
 * 
 * Get or create sub-subjects under a category.
 * The route accepts both slug (e.g., "mathematics") and UUID.
 * Only admins and teachers can create sub-subjects.
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
        let parent;

        if (uuidPattern.test(slug)) {
            // It's a UUID, get by ID
            parent = await SubjectsService.getById(slug);
            if (parent) {
                // Get children using service
                const rlsContext = {
                    userId: authResult.user.id,
                    role: authResult.profile.role,
                    email: authResult.user.email,
                };
                const children = await SubjectsService.getChildSubjects(slug, rlsContext);
                
                // Transform to snake_case
                const transformed = children.map((s) => ({
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
                }));

                return successResponse(transformed);
            }
        } else {
            // It's a slug, get by slug
            parent = await SubjectsService.getBySlug(slug);
            if (parent) {
                // Get children from the subject's sub_subjects
                const children = parent.sub_subjects || [];
                return successResponse(children);
            }
        }

        if (!parent) {
            return ApiErrors.notFound('Subject not found');
        }

        return successResponse([]);
    } catch (error) {
        console.error('[API] Get children error:', error);
        return ApiErrors.serverError('Failed to fetch sub-subjects');
    }
}

export async function POST(request: NextRequest, context: Params) {
    try {
        // Authenticate - require admin or teacher role
        const authResult = await authenticateRequest(request, {
            requireStudent: false,
            allowedRoles: ['admin', 'teacher']
        });
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const { slug } = await context.params;
        if (!slug) {
            return ApiErrors.badRequest('Parent subject slug or ID is required');
        }

        const body = await request.json();
        const { name_en, name_mr, description_en, description_mr, icon, order_index } = body;

        // Validate required fields
        if (!name_en || !name_mr) {
            return ApiErrors.badRequest('name_en and name_mr are required');
        }

        // Check if slug is UUID or actual slug
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        let parent;

        if (uuidPattern.test(slug)) {
            // It's a UUID, get by ID
            parent = await SubjectsService.getById(slug);
        } else {
            // It's a slug, get by slug
            parent = await SubjectsService.getBySlug(slug);
        }

        if (!parent) {
            return ApiErrors.notFound('Parent subject not found');
        }

        // Verify parent is a category
        if (!parent.isCategory) {
            return ApiErrors.badRequest('Sub-subjects can only be added to categories');
        }

        // Generate slug from name
        const subjectSlug = `${parent.slug}-${name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

        // Check if slug already exists
        const existing = await SubjectsService.getBySlug(subjectSlug);
        if (existing) {
            return ApiErrors.conflict('A sub-subject with this name already exists');
        }

        // Create child subject using service
        const rlsContext = {
            userId: authResult.user.id,
            role: authResult.profile.role,
            email: authResult.user.email,
        };

        const result = await SubjectsService.createChild(
            parent.id,
            {
                nameEn: name_en,
                nameMr: name_mr,
                descriptionEn: description_en || null,
                descriptionMr: description_mr || null,
                icon: icon || null,
                orderIndex: order_index ?? null,
            },
            rlsContext
        );

        if (!result.success || !result.data) {
            return ApiErrors.serverError(result.error || 'Failed to create sub-subject');
        }

        const newSubject = result.data;

        return successResponse({
            id: newSubject.id,
            name_en: newSubject.nameEn,
            name_mr: newSubject.nameMr,
            slug: newSubject.slug,
            description_en: newSubject.descriptionEn,
            description_mr: newSubject.descriptionMr,
            icon: newSubject.icon,
            order_index: newSubject.orderIndex,
            is_active: newSubject.isActive,
            is_category: newSubject.isCategory,
            parent_subject_id: newSubject.parentSubjectId,
        }, 201);
    } catch (error) {
        console.error('[API] Create sub-subject error:', error);
        return ApiErrors.serverError('Failed to create sub-subject');
    }
}
