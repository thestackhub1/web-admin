/**
 * GET /api/v1/exams/[id]
 * DELETE /api/v1/exams/[id]
 *
 * Get or delete a single exam attempt by ID.
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { ExamsService } from '@/lib/services';
import { z } from 'zod';

type Params = { params: Promise<{ id: string }> };

const uuidSchema = z.string().uuid('Invalid exam ID format');

export async function GET(request: NextRequest, context: Params) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const { id } = await context.params;

        const uuidResult = uuidSchema.safeParse(id);
        if (!uuidResult.success) {
            return ApiErrors.badRequest('Invalid exam ID format');
        }

        const rlsContext = {
            userId: authResult.user.id,
            role: authResult.profile.role,
            email: authResult.user.email,
        };

        // Get exam attempt
        const exam = await ExamsService.getById(id, rlsContext) as any;

        if (!exam) {
            return ApiErrors.notFound('Exam attempt not found');
        }

        // Transform to snake_case
        const transformed = {
            id: exam.id,
            user_id: exam.userId,
            status: exam.status,
            score: exam.score,
            total_marks: exam.totalMarks,
            percentage: exam.percentage ? Number(exam.percentage) : null,
            started_at: exam.startedAt ? new Date(exam.startedAt).toISOString() : null,
            completed_at: exam.completedAt ? new Date(exam.completedAt).toISOString() : null,
            subject_id: exam.subjectId,
            exam_structure_id: exam.examStructureId,
            scheduled_exam_id: exam.scheduledExamId,
            profiles: exam.profile ? {
                id: exam.profile.id,
                name: exam.profile.name,
                email: exam.profile.email,
                avatar_url: exam.profile.avatarUrl,
                phone: exam.profile.phone,
            } : null,
            subjects: exam.subject ? {
                id: exam.subject.id,
                name_en: exam.subject.nameEn,
                name_mr: exam.subject.nameMr,
                slug: exam.subject.slug,
            } : null,
            exam_structures: exam.examStructure ? {
                id: exam.examStructure.id,
                name_en: exam.examStructure.nameEn,
                name_mr: exam.examStructure.nameMr,
                passing_percentage: exam.examStructure.passingPercentage,
            } : null,
            scheduled_exams: exam.scheduledExam ? {
                id: exam.scheduledExam.id,
                name_en: exam.scheduledExam.nameEn,
                name_mr: exam.scheduledExam.nameMr,
                class_levels: exam.scheduledExam.classLevel ? {
                    id: exam.scheduledExam.classLevel.id,
                    name_en: exam.scheduledExam.classLevel.nameEn,
                    name_mr: exam.scheduledExam.classLevel.nameMr,
                    slug: exam.scheduledExam.classLevel.slug,
                } : null,
            } : null,
        };

        return successResponse(transformed);
    } catch (error) {
        console.error('[API] Exam attempt by ID error:', error);
        return ApiErrors.serverError('Failed to fetch exam attempt');
    }
}

export async function DELETE(request: NextRequest, context: Params) {
    try {
        // Authenticate - require admin role
        const authResult = await authenticateRequest(request, {
            allowedRoles: ['admin', 'super_admin']
        });
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const { id } = await context.params;

        const uuidResult = uuidSchema.safeParse(id);
        if (!uuidResult.success) {
            return ApiErrors.badRequest('Invalid exam ID format');
        }

        const rlsContext = {
            userId: authResult.user.id,
            role: authResult.profile.role,
            email: authResult.user.email,
        };

        // Delete exam attempt
        const result = await ExamsService.delete(id, rlsContext);

        if (!result.success) {
            return ApiErrors.forbidden(result.error || 'Failed to delete exam attempt');
        }

        return successResponse({ success: true });
    } catch (error) {
        console.error('[API] Delete exam attempt error:', error);
        return ApiErrors.serverError('Failed to delete exam attempt');
    }
}
