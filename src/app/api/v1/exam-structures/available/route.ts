/**
 * GET /api/v1/exam-structures/available
 * 
 * Get available exam structures filtered by class level and subject.
 * Query params: class_level_id (optional), subject_id (required)
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { ExamStructuresService } from '@/lib/services';

export async function GET(request: NextRequest) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const url = new URL(request.url);
        const classLevelId = url.searchParams.get('class_level_id') || undefined;
        const subjectId = url.searchParams.get('subject_id');

        if (!subjectId) {
            return ApiErrors.badRequest('subject_id is required');
        }

        // Get all exam structures for the subject
        const structures = await ExamStructuresService.getAll({
            subjectId,
        });

        // Filter by class level if provided
        let filtered = structures;
        if (classLevelId) {
            filtered = structures.filter((s) => !s.class_level || s.class_level === classLevelId);
        }

        // Transform to snake_case
        const transformed = filtered.map((s) => ({
            id: s.id,
            name_en: s.name_en,
            name_mr: s.name_mr,
            total_marks: s.total_marks,
            total_questions: s.total_questions,
            duration_minutes: s.duration_minutes,
            sections: s.sections,
        }));

        return successResponse(transformed);
    } catch (error) {
        console.error('[API] Available exam structures error:', error);
        return ApiErrors.serverError('Failed to fetch exam structures');
    }
}


