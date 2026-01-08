/**
 * GET /api/v1/exams
 * 
 * Get all exam attempts with optional filtering by user_id.
 * Query params: user_id (optional) - Filter exams by user
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { ExamsService } from '@/lib/services';

export async function GET(request: NextRequest) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request, { requireStudent: false });
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id') || undefined;
        const subjectId = searchParams.get('subject_id') || undefined;
        const status = searchParams.get('status') || undefined;
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('page_size') || '20');

        const result = await ExamsService.getAll(
            { userId, subjectId, status, page, pageSize },
            {
                userId: authResult.user.id,
                role: authResult.profile.role,
                email: authResult.user.email,
            }
        );

        return successResponse({
            items: result.items,
            pagination: {
                page: result.page,
                page_size: result.pageSize,
                total_items: result.totalItems,
                total_pages: result.totalPages,
                has_next_page: result.page < result.totalPages,
                has_previous_page: result.page > 1,
            },
        });
    } catch (error) {
        console.error('[API] Exams error:', error);
        return ApiErrors.serverError('Failed to fetch exams');
    }
}

