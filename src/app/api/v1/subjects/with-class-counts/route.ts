/**
 * GET /api/v1/subjects/with-class-counts
 *
 * Get all active subjects with their class level mapping counts.
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { SubjectsService } from '@/lib/services';

export async function GET(request: NextRequest) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const rlsContext = {
            userId: authResult.user.id,
            role: authResult.profile.role,
            email: authResult.user.email,
        };

        // Get subjects with class counts using service
        const subjectsWithCounts = await SubjectsService.getSubjectsWithClassCounts(rlsContext);

        // Transform to API format
        const transformed = subjectsWithCounts.map((subject) => ({
            id: subject.id,
            name_en: subject.nameEn,
            name_mr: subject.nameMr,
            slug: subject.slug,
            description_en: subject.descriptionEn,
            description_mr: subject.descriptionMr,
            icon: subject.icon,
            order_index: subject.orderIndex,
            is_active: subject.isActive,
            is_category: subject.isCategory,
            is_paper: subject.isPaper,
            paper_number: subject.paperNumber,
            subject_class_mappings: [{ count: subject.classCount }],
        }));

        return successResponse(transformed);
    } catch (error) {
        console.error('[API] Subjects with class counts error:', error);
        return ApiErrors.serverError('Failed to fetch subjects with class counts');
    }
}

