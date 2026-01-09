/**
 * GET /api/v1/exam-structures
 * POST /api/v1/exam-structures
 * 
 * Get all active exam structures or create a new one.
 * Optional query param: subject_id
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { ExamStructuresService } from '@/lib/services';
import { z } from 'zod';

const createExamStructureSchema = z.object({
    subject_id: z.string().uuid(),
    class_level_id: z.string().uuid().nullable().optional(),
    name_en: z.string().min(1),
    name_mr: z.string().min(1),
    description_en: z.string().nullable().optional(),
    description_mr: z.string().nullable().optional(),
    class_level: z.string().nullable().optional(),
    duration_minutes: z.number().int().positive(),
    total_questions: z.number().int().positive(),
    total_marks: z.number().int().positive(),
    passing_percentage: z.number().int().min(0).max(100),
    sections: z.array(z.any()).optional(),
    is_template: z.boolean().optional(),
    order_index: z.number().int().optional(),
    is_active: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const url = new URL(request.url);
        const subjectId = url.searchParams.get('subject_id');

        // Use service layer
        const examStructures = await ExamStructuresService.getAll({
            subjectId: subjectId || undefined,
            includeInactive: true, // Fetch all structures (active + drafts) for admin dashboard
        });

        return successResponse(examStructures);
    } catch (error) {
        console.error('[API] Exam structures error:', error);
        return ApiErrors.serverError('Failed to fetch exam structures');
    }
}

export async function POST(request: NextRequest) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        // Only admins can create exam structures
        if (!['admin', 'super_admin'].includes(authResult.profile.role)) {
            return ApiErrors.forbidden('Only admins can create exam structures');
        }

        const body = await request.json();
        const parsed = createExamStructureSchema.safeParse(body);

        if (!parsed.success) {
            return ApiErrors.validationError(parsed.error.issues[0].message);
        }

        const rlsContext = {
            userId: authResult.user.id,
            role: authResult.profile.role,
            email: authResult.user.email,
        };

        const result = await ExamStructuresService.create({
            subjectId: parsed.data.subject_id,
            classLevelId: parsed.data.class_level_id || null,
            nameEn: parsed.data.name_en,
            nameMr: parsed.data.name_mr,
            descriptionEn: parsed.data.description_en || null,
            descriptionMr: parsed.data.description_mr || null,
            classLevel: parsed.data.class_level || null,
            durationMinutes: parsed.data.duration_minutes,
            totalQuestions: parsed.data.total_questions,
            totalMarks: parsed.data.total_marks,
            passingPercentage: parsed.data.passing_percentage,
            sections: parsed.data.sections || [],
            isTemplate: parsed.data.is_template || false,
            orderIndex: parsed.data.order_index || 0,
            isActive: parsed.data.is_active ?? true,
        }, rlsContext);

        if (!result.success || !result.data) {
            return ApiErrors.serverError('Failed to create exam structure');
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
        console.error('[API] Create exam structure error:', error);
        return ApiErrors.serverError('Failed to create exam structure');
    }
}
