/**
 * GET /api/v1/exam-structures/[id]
 * PUT /api/v1/exam-structures/[id]
 * DELETE /api/v1/exam-structures/[id]
 * 
 * Get, update, or delete a single exam structure by ID.
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { ExamStructuresService } from '@/lib/services';
import { z } from 'zod';

type Params = { params: Promise<{ id: string }> };

const updateExamStructureSchema = z.object({
  subject_id: z.string().uuid().optional(),
  class_level_id: z.string().uuid().nullable().optional(),
  name_en: z.string().min(1).optional(),
  name_mr: z.string().min(1).optional(),
  description_en: z.string().nullable().optional(),
  description_mr: z.string().nullable().optional(),
  class_level: z.string().nullable().optional(),
  duration_minutes: z.number().int().positive().optional(),
  total_questions: z.number().int().positive().optional(),
  total_marks: z.number().int().positive().optional(),
  passing_percentage: z.number().int().min(0).max(100).optional(),
  sections: z.array(z.any()).optional(),
  is_template: z.boolean().optional(),
  order_index: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

export async function GET(request: NextRequest, context: Params) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const { id } = await context.params;

        if (!id) {
            return ApiErrors.badRequest('Exam structure ID is required');
        }

        // Use service layer
        const examStructure = await ExamStructuresService.getById(id);

        if (!examStructure) {
            return ApiErrors.notFound('Exam structure not found');
        }

        // Transform to snake_case for API response
        const transformed = {
            id: examStructure.id,
            subject_id: examStructure.subjectId,
            name_en: examStructure.nameEn,
            name_mr: examStructure.nameMr,
            description_en: examStructure.descriptionEn,
            description_mr: examStructure.descriptionMr,
            class_level: examStructure.classLevel,
            duration_minutes: examStructure.durationMinutes,
            total_questions: examStructure.totalQuestions,
            total_marks: examStructure.totalMarks,
            passing_percentage: examStructure.passingPercentage,
            sections: examStructure.sections,
            order_index: examStructure.orderIndex,
            is_active: examStructure.isActive,
        };

        return successResponse(transformed);
    } catch (error) {
        console.error('[API] Exam structure by ID error:', error);
        return ApiErrors.serverError('Failed to fetch exam structure');
    }
}

export async function PUT(request: NextRequest, context: Params) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        // Only admins can update exam structures
        if (!['admin', 'super_admin'].includes(authResult.profile.role)) {
            return ApiErrors.forbidden('Only admins can update exam structures');
        }

        const { id } = await context.params;
        if (!id) {
            return ApiErrors.badRequest('Exam structure ID is required');
        }

        const body = await request.json();
        const parsed = updateExamStructureSchema.safeParse(body);

        if (!parsed.success) {
            return ApiErrors.validationError(parsed.error.issues[0].message);
        }

        const rlsContext = {
            userId: authResult.user.id,
            role: authResult.profile.role,
            email: authResult.user.email,
        };

        const updateData: any = {};
        if (parsed.data.subject_id !== undefined) updateData.subjectId = parsed.data.subject_id;
        if (parsed.data.class_level_id !== undefined) updateData.classLevelId = parsed.data.class_level_id;
        if (parsed.data.name_en !== undefined) updateData.nameEn = parsed.data.name_en;
        if (parsed.data.name_mr !== undefined) updateData.nameMr = parsed.data.name_mr;
        if (parsed.data.description_en !== undefined) updateData.descriptionEn = parsed.data.description_en;
        if (parsed.data.description_mr !== undefined) updateData.descriptionMr = parsed.data.description_mr;
        if (parsed.data.class_level !== undefined) updateData.classLevel = parsed.data.class_level;
        if (parsed.data.duration_minutes !== undefined) updateData.durationMinutes = parsed.data.duration_minutes;
        if (parsed.data.total_questions !== undefined) updateData.totalQuestions = parsed.data.total_questions;
        if (parsed.data.total_marks !== undefined) updateData.totalMarks = parsed.data.total_marks;
        if (parsed.data.passing_percentage !== undefined) updateData.passingPercentage = parsed.data.passing_percentage;
        if (parsed.data.sections !== undefined) updateData.sections = parsed.data.sections;
        if (parsed.data.is_template !== undefined) updateData.isTemplate = parsed.data.is_template;
        if (parsed.data.order_index !== undefined) updateData.orderIndex = parsed.data.order_index;
        if (parsed.data.is_active !== undefined) updateData.isActive = parsed.data.is_active;

        const result = await ExamStructuresService.update(id, updateData, rlsContext);

        if (!result.success || !result.data) {
            return ApiErrors.serverError(result.error || 'Failed to update exam structure');
        }

        return successResponse({
            id: result.data.id,
            subject_id: result.data.subjectId,
            name_en: result.data.nameEn,
            name_mr: result.data.nameMr,
            description_en: result.data.descriptionEn,
            description_mr: result.data.descriptionMr,
            class_level: result.data.classLevel,
            duration_minutes: result.data.durationMinutes,
            total_questions: result.data.totalQuestions,
            total_marks: result.data.totalMarks,
            passing_percentage: result.data.passingPercentage,
            sections: result.data.sections,
            order_index: result.data.orderIndex,
            is_active: result.data.isActive,
        });
    } catch (error) {
        console.error('[API] Update exam structure error:', error);
        return ApiErrors.serverError('Failed to update exam structure');
    }
}

export async function DELETE(request: NextRequest, context: Params) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        // Only admins can delete exam structures
        if (!['admin', 'super_admin'].includes(authResult.profile.role)) {
            return ApiErrors.forbidden('Only admins can delete exam structures');
        }

        const { id } = await context.params;
        if (!id) {
            return ApiErrors.badRequest('Exam structure ID is required');
        }

        const rlsContext = {
            userId: authResult.user.id,
            role: authResult.profile.role,
            email: authResult.user.email,
        };

        const result = await ExamStructuresService.delete(id, rlsContext);

        if (!result.success) {
            return ApiErrors.serverError(result.error || 'Failed to delete exam structure');
        }

        return successResponse({ success: true });
    } catch (error) {
        console.error('[API] Delete exam structure error:', error);
        return ApiErrors.serverError('Failed to delete exam structure');
    }
}

