/**
 * GET /api/v1/scheduled-exams/[id]/stats
 * 
 * Get exam attempt statistics for a scheduled exam.
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { ScheduledExamsService } from '@/lib/services';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Params) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const { id } = await context.params;

        if (!id) {
            return ApiErrors.badRequest('Exam ID is required');
        }

        const rlsContext = {
            userId: authResult.user.id,
            role: authResult.profile.role,
            email: authResult.user.email,
        };

        // Get stats using service
        const stats = await ScheduledExamsService.getExamStats(id, rlsContext);

        return successResponse({
            total_attempts: stats.totalAttempts,
            completed_attempts: stats.completedAttempts,
        });
    } catch (error) {
        console.error('[API] Exam stats error:', error);
        return ApiErrors.serverError('Failed to fetch exam statistics');
    }
}

