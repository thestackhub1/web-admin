/**
 * GET /api/v1/scheduled-exams/[id]
 * PUT /api/v1/scheduled-exams/[id]
 * DELETE /api/v1/scheduled-exams/[id]
 * PATCH /api/v1/scheduled-exams/[id]/status
 * 
 * Get, update, delete, or update status of a scheduled exam.
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { ScheduledExamsService, ExamStructuresService } from '@/lib/services';
import { z } from 'zod';

type Params = { params: Promise<{ id: string }> };

// UUID validation schema
const uuidSchema = z.string().uuid('Invalid exam ID format');

const updateScheduledExamSchema = z.object({
  name_en: z.string().min(1).optional(),
  name_mr: z.string().min(1).optional(),
  description_en: z.string().nullable().optional(),
  description_mr: z.string().nullable().optional(),
  class_level_id: z.string().uuid().optional(),
  subject_id: z.string().uuid().optional(),
  exam_structure_id: z.string().uuid().nullable().optional(),
  total_marks: z.number().int().positive().optional(),
  duration_minutes: z.number().int().positive().optional(),
  scheduled_date: z.string().nullable().optional(),
  scheduled_time: z.string().nullable().optional(),
  status: z.string().optional(),
  order_index: z.number().int().optional(),
  is_active: z.boolean().optional(),
  publish_results: z.boolean().optional(),
  max_attempts: z.number().int().min(0).optional(),
});

export async function GET(request: NextRequest, context: Params) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const { id } = await context.params;

        // Validate UUID format
        const uuidResult = uuidSchema.safeParse(id);
        if (!uuidResult.success) {
            return ApiErrors.badRequest('Invalid exam ID format');
        }

        // Use service to fetch scheduled exam
        const exam = await ScheduledExamsService.getById(
            id,
            {
                userId: authResult.user.id,
                role: authResult.profile.role,
                email: authResult.user.email,
            }
        );

        if (!exam) {
            return ApiErrors.notFound('Scheduled exam not found');
        }

        // Check if student can access this exam (only published or in_progress)
        if (authResult.profile.role === 'student' && !['published', 'in_progress'].includes(exam.status)) {
            return ApiErrors.forbidden('This exam is not available');
        }

        // Get user's attempt counts
        const { attemptCounts, inProgressExams } = await ScheduledExamsService.getUserAttemptCounts(
            [id],
            authResult.user.id,
            {
                userId: authResult.user.id,
                role: authResult.profile.role,
                email: authResult.user.email,
            }
        );

        const currentAttemptCount = attemptCounts[id] || 0;
        const maxAttempts = exam.max_attempts || 0;
        const canAttempt = maxAttempts === 0 || currentAttemptCount < maxAttempts;
        const remainingAttempts = maxAttempts > 0 ? Math.max(0, maxAttempts - currentAttemptCount) : null;
        const hasInProgress = inProgressExams[id] || false;

        // Enrich response with attempt info
        const enrichedExam = {
            ...exam,
            attempt_count: currentAttemptCount,
            remaining_attempts: remainingAttempts,
            can_attempt: canAttempt,
            has_in_progress: hasInProgress,
        };

        return successResponse(enrichedExam);
    } catch (error) {
        console.error('[API] Scheduled exam by ID error:', error);
        return ApiErrors.serverError('Failed to fetch scheduled exam');
    }
}
