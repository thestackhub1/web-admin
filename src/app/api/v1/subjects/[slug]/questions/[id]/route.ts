/**
 * GET /api/v1/subjects/[slug]/questions/[id]
 *
 * Get a single question by ID for a subject.
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { QuestionsService } from '@/lib/services';
import { z } from 'zod';

type Params = { params: Promise<{ slug: string; id: string }> };

const uuidSchema = z.string().uuid('Invalid question ID format');

export async function GET(request: NextRequest, context: Params) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const { slug, id } = await context.params;

        if (!slug || !id) {
            return ApiErrors.badRequest('Subject slug and question ID are required');
        }

        const uuidResult = uuidSchema.safeParse(id);
        if (!uuidResult.success) {
            return ApiErrors.badRequest('Invalid question ID format');
        }

        const rlsContext = {
            userId: authResult.user.id,
            role: authResult.profile.role,
            email: authResult.user.email,
        };

        // Get question by ID
        const question = await QuestionsService.getById(slug, id, rlsContext);

        if (!question) {
            return ApiErrors.notFound('Question not found');
        }

        return successResponse(question);
    } catch (error) {
        console.error('[API] Question by ID error:', error);
        return ApiErrors.serverError('Failed to fetch question');
    }
}

export async function PUT(request: NextRequest, context: Params) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        // Only admins and teachers can update questions
        if (!['admin', 'super_admin', 'teacher'].includes(authResult.profile.role)) {
            return ApiErrors.forbidden('Only admins and teachers can update questions');
        }

        const { slug, id } = await context.params;

        if (!slug || !id) {
            return ApiErrors.badRequest('Subject slug and question ID are required');
        }

        const uuidResult = uuidSchema.safeParse(id);
        if (!uuidResult.success) {
            return ApiErrors.badRequest('Invalid question ID format');
        }

        const body = await request.json();
        const updateQuestionSchema = z.object({
            question_text: z.string().min(1).optional(),
            question_language: z.enum(['en', 'mr']).optional(),
            question_text_secondary: z.string().nullable().optional(),
            secondary_language: z.enum(['en', 'mr']).nullable().optional(),
            question_type: z.string().min(1).optional(),
            difficulty: z.string().min(1).optional(),
            chapter_id: z.string().uuid().nullable().optional(),
            answer_data: z.any().optional(),
            explanation_en: z.string().nullable().optional(),
            explanation_mr: z.string().nullable().optional(),
            tags: z.array(z.string()).optional(),
            class_level: z.string().nullable().optional(),
            marks: z.number().int().positive().optional(),
            is_active: z.boolean().optional(),
        });

        const parsed = updateQuestionSchema.safeParse(body);

        if (!parsed.success) {
            return ApiErrors.validationError(parsed.error.issues[0].message);
        }

        const rlsContext = {
            userId: authResult.user.id,
            role: authResult.profile.role,
            email: authResult.user.email,
        };

        const updateData: any = {};
        if (parsed.data.question_text !== undefined) updateData.questionText = parsed.data.question_text;
        if (parsed.data.question_language !== undefined) updateData.questionLanguage = parsed.data.question_language;
        if (parsed.data.question_type !== undefined) updateData.questionType = parsed.data.question_type;
        if (parsed.data.difficulty !== undefined) updateData.difficulty = parsed.data.difficulty;
        if (parsed.data.chapter_id !== undefined) updateData.chapterId = parsed.data.chapter_id;
        if (parsed.data.answer_data !== undefined) updateData.answerData = parsed.data.answer_data;
        if (parsed.data.explanation !== undefined) updateData.explanation = parsed.data.explanation;
        if (parsed.data.tags !== undefined) updateData.tags = parsed.data.tags;
        if (parsed.data.class_level !== undefined) updateData.classLevel = parsed.data.class_level;
        if (parsed.data.marks !== undefined) updateData.marks = parsed.data.marks;
        if (parsed.data.is_active !== undefined) updateData.isActive = parsed.data.is_active;

        const result = await QuestionsService.update(slug, id, updateData, rlsContext);

        if (!result.success || !result.data) {
            return ApiErrors.serverError(result.error || 'Failed to update question');
        }

        return successResponse({
            id: result.data.id,
            question_text: result.data.questionText,
            question_language: result.data.questionLanguage,
            question_type: result.data.questionType,
            difficulty: result.data.difficulty,
        });
    } catch (error) {
        console.error('[API] Update question error:', error);
        return ApiErrors.serverError('Failed to update question');
    }
}

export async function DELETE(request: NextRequest, context: Params) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        // Only admins and teachers can delete questions
        if (!['admin', 'super_admin', 'teacher'].includes(authResult.profile.role)) {
            return ApiErrors.forbidden('Only admins and teachers can delete questions');
        }

        const { slug, id } = await context.params;

        if (!slug || !id) {
            return ApiErrors.badRequest('Subject slug and question ID are required');
        }

        const uuidResult = uuidSchema.safeParse(id);
        if (!uuidResult.success) {
            return ApiErrors.badRequest('Invalid question ID format');
        }

        const rlsContext = {
            userId: authResult.user.id,
            role: authResult.profile.role,
            email: authResult.user.email,
        };

        const result = await QuestionsService.delete(slug, id, rlsContext);

        if (!result.success) {
            return ApiErrors.serverError(result.error || 'Failed to delete question');
        }

        return successResponse({ success: true });
    } catch (error) {
        console.error('[API] Delete question error:', error);
        return ApiErrors.serverError('Failed to delete question');
    }
}

