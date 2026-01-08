/**
 * GET /api/v1/scheduled-exams/counts-by-subject
 *
 * Get scheduled exam counts grouped by subject ID.
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { ScheduledExamsService } from '@/lib/services';

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

        // Get all active scheduled exams
        const exams = await ScheduledExamsService.getAll(
            { status: 'published' },
            rlsContext
        );

        // Count by subject_id
        const counts: Record<string, number> = {};
        exams.forEach((exam) => {
            if (exam.subject_id) {
                counts[exam.subject_id] = (counts[exam.subject_id] || 0) + 1;
            }
        });

        return successResponse(counts);
    } catch (error) {
        console.error('[API] Scheduled exam counts by subject error:', error);
        return ApiErrors.serverError('Failed to fetch scheduled exam counts');
    }
}


