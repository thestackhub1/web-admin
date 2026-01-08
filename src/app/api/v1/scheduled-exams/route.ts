/**
 * GET /api/v1/scheduled-exams
 * POST /api/v1/scheduled-exams
 * 
 * Get published scheduled exams for the student or create a new one.
 * Query params: subject_id, subject_slug, class_level_id, status
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { ScheduledExamsService, ExamStructuresService } from '@/lib/services';
import { z } from 'zod';

const createScheduledExamSchema = z.object({
  name_en: z.string().min(1),
  name_mr: z.string().min(1),
  description_en: z.string().nullable().optional(),
  description_mr: z.string().nullable().optional(),
  class_level_id: z.string().uuid(),
  subject_id: z.string().uuid(),
  exam_structure_id: z.string().uuid().nullable().optional(),
  total_marks: z.number().int().positive(),
  duration_minutes: z.number().int().positive(),
  scheduled_date: z.string().nullable().optional(),
  scheduled_time: z.string().nullable().optional(),
  status: z.string().optional(),
  order_index: z.number().int().optional(),
  is_active: z.boolean().optional(),
  publish_results: z.boolean().optional(),
  max_attempts: z.number().int().min(0).optional(),
});

export async function GET(request: NextRequest) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const url = new URL(request.url);
        const subjectId = url.searchParams.get('subject_id') || undefined;
        const subjectSlug = url.searchParams.get('subject_slug') || undefined;
        const classLevelId = url.searchParams.get('class_level_id') || undefined;
        const status = url.searchParams.get('status') || 'published';

        // Use service to fetch scheduled exams
        const exams = await ScheduledExamsService.getAll(
            {
                subjectId,
                subjectSlug,
                classLevelId,
                status,
            },
            {
                userId: authResult.user.id,
                role: authResult.profile.role,
                email: authResult.user.email,
            }
        );

        // Get user's attempt counts for each exam
        const examIds = exams.map((exam) => exam.id);
        const { attemptCounts, inProgressExams } = await ScheduledExamsService.getUserAttemptCounts(
            examIds,
            authResult.user.id,
            {
                userId: authResult.user.id,
                role: authResult.profile.role,
                email: authResult.user.email,
            }
        );

        // Enrich exams with attempt info
        const enrichedData = exams.map((exam) => {
            const attemptCount = attemptCounts[exam.id] || 0;
            const maxAttempts = exam.max_attempts || 0;
            const hasInProgress = inProgressExams[exam.id] || false;

            return {
                ...exam,
                attempt_count: attemptCount,
                remaining_attempts: maxAttempts > 0 ? Math.max(0, maxAttempts - attemptCount) : null,
                can_attempt: maxAttempts === 0 || attemptCount < maxAttempts,
                has_in_progress: hasInProgress,
            };
        });

        return successResponse(enrichedData);
    } catch (error) {
        console.error('[API] Scheduled exams error:', error);
        return ApiErrors.serverError('Failed to fetch scheduled exams');
    }
}

export async function POST(request: NextRequest) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        // Only admins can create scheduled exams
        if (!['admin', 'super_admin'].includes(authResult.profile.role)) {
            return ApiErrors.forbidden('Only admins can create scheduled exams');
        }

        const body = await request.json();
        const parsed = createScheduledExamSchema.safeParse(body);

        if (!parsed.success) {
            return ApiErrors.validationError(parsed.error.issues[0].message);
        }

        const rlsContext = {
            userId: authResult.user.id,
            role: authResult.profile.role,
            email: authResult.user.email,
        };

        // If exam_structure_id is provided, get its total_marks and duration_minutes
        let totalMarks = parsed.data.total_marks;
        let durationMinutes = parsed.data.duration_minutes;

        if (parsed.data.exam_structure_id) {
            const structure = await ExamStructuresService.getById(parsed.data.exam_structure_id, rlsContext);
            if (structure) {
                totalMarks = structure.totalMarks;
                durationMinutes = structure.durationMinutes;
            }
        }

        const result = await ScheduledExamsService.create({
            nameEn: parsed.data.name_en,
            nameMr: parsed.data.name_mr,
            descriptionEn: parsed.data.description_en || null,
            descriptionMr: parsed.data.description_mr || null,
            classLevelId: parsed.data.class_level_id,
            subjectId: parsed.data.subject_id,
            examStructureId: parsed.data.exam_structure_id || null,
            totalMarks,
            durationMinutes,
            scheduledDate: parsed.data.scheduled_date || null,
            scheduledTime: parsed.data.scheduled_time || null,
            status: parsed.data.status || 'draft',
            orderIndex: parsed.data.order_index,
            isActive: parsed.data.is_active ?? true,
            publishResults: parsed.data.publish_results ?? false,
            maxAttempts: parsed.data.max_attempts ?? 0,
        }, rlsContext);

        if (!result.success) {
            return ApiErrors.serverError('Failed to create scheduled exam');
        }

        return successResponse({
            id: result.data.id,
            name_en: result.data.nameEn,
            name_mr: result.data.nameMr,
            description_en: result.data.descriptionEn,
            description_mr: result.data.descriptionMr,
            class_level_id: result.data.classLevelId,
            subject_id: result.data.subjectId,
            exam_structure_id: result.data.examStructureId,
            total_marks: result.data.totalMarks,
            duration_minutes: result.data.durationMinutes,
            scheduled_date: result.data.scheduledDate,
            scheduled_time: result.data.scheduledTime,
            status: result.data.status,
            order_index: result.data.orderIndex,
            is_active: result.data.isActive,
            publish_results: result.data.publishResults,
            max_attempts: result.data.maxAttempts,
        });
    } catch (error) {
        console.error('[API] Create scheduled exam error:', error);
        return ApiErrors.serverError('Failed to create scheduled exam');
    }
}
