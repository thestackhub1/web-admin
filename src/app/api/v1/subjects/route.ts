/**
 * GET /api/v1/subjects
 * 
 * Get all active subjects, optionally filtered by class_level_id or parent_id.
 * Query params: 
 *   - class_level_id (optional) - UUID of the class level to filter by
 *   - parent_id (optional) - UUID of the parent subject to get children
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { SubjectsService } from '@/lib/services';

export async function GET(request: NextRequest) {
    try {
        // Allow all authenticated users to view subjects
        const authResult = await authenticateRequest(request, { requireStudent: false });
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const url = new URL(request.url);
        const classLevelId = url.searchParams.get('class_level_id');
        const parentId = url.searchParams.get('parent_id');

        // Transform to snake_case for API response
        const transformSubject = (s: any): any => ({
            id: s.id,
            parent_subject_id: s.parentSubjectId,
            name_en: s.nameEn,
            name_mr: s.nameMr,
            slug: s.slug,
            description_en: s.descriptionEn,
            description_mr: s.descriptionMr,
            icon: s.icon,
            order_index: s.orderIndex,
            is_active: s.isActive,
            is_category: s.isCategory,
            is_paper: s.isPaper,
            paper_number: s.paperNumber,
            created_at: s.createdAt,
            updated_at: s.updatedAt,
            sub_subjects: s.sub_subjects?.map(transformSubject) || [],
        });

        // If parent_id is provided, get child subjects
        if (parentId) {
            const children = await SubjectsService.getChildSubjects(parentId);
            return successResponse(children.map(transformSubject));
        }

        // Otherwise, get all subjects with optional class level filter
        const subjects = await SubjectsService.getAll({
            classLevelId: classLevelId || undefined,
        });

        const result = subjects.map(transformSubject);

        return successResponse(result);
    } catch (error) {
        console.error('[API] Subjects error:', error);
        return ApiErrors.serverError('Failed to fetch subjects');
    }
}
