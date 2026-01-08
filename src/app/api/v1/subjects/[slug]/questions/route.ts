/**
 * GET /api/v1/subjects/[slug]/questions
 * 
 * Get questions for a subject with optional filtering.
 * Query params: difficulty, limit, chapter_id, type
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { QuestionsService } from '@/lib/services';
import { isSubjectSupported } from '@/lib/services/questions.service';
import { z } from 'zod';

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, context: Params) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const { slug } = await context.params;

        if (!slug) {
            return ApiErrors.badRequest('Subject slug is required');
        }

        // Check if subject is supported
        if (!isSubjectSupported(slug)) {
            return ApiErrors.notFound(`Subject '${slug}' not found or not supported`);
        }

        // Parse query params
        const { searchParams } = new URL(request.url);
        const difficulty = searchParams.get('difficulty') || undefined;
        const limit = parseInt(searchParams.get('limit') || '50');
        const chapterId = searchParams.get('chapter_id') || undefined;
        const type = searchParams.get('type') || undefined;

        // Use service to fetch questions
        const questions = await QuestionsService.getBySubject(
            slug,
            {
                chapterId,
                difficulty,
                questionType: type,
                isActive: true,
                limit: Math.min(limit, 100), // Cap at 100
            },
            {
                userId: authResult.user.id,
                role: authResult.profile.role,
                email: authResult.user.email,
            }
        );

        // Return questions array directly for compatibility with mobile app
        return successResponse(questions);
    } catch (error) {
        console.error('[API] Subject questions error:', error);
        return ApiErrors.serverError('Failed to fetch questions');
    }
}

export async function POST(request: NextRequest, context: Params) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        // Only admins and teachers can create questions
        if (!['admin', 'super_admin', 'teacher'].includes(authResult.profile.role)) {
            return ApiErrors.forbidden('Only admins and teachers can create questions');
        }

        const { slug } = await context.params;

        if (!slug) {
            return ApiErrors.badRequest('Subject slug is required');
        }

        // Check if subject is supported
        if (!isSubjectSupported(slug)) {
            return ApiErrors.notFound(`Subject '${slug}' not found or not supported`);
        }

        const body = await request.json();
        const createQuestionSchema = z.object({
            question_text: z.string().min(1),
            question_language: z.enum(['en', 'mr']),
            question_text_secondary: z.string().nullable().optional(),
            secondary_language: z.enum(['en', 'mr']).nullable().optional(),
            question_type: z.string().min(1),
            difficulty: z.string().min(1),
            chapter_id: z.string().uuid().nullable().optional(),
            answer_data: z.any(),
            explanation_en: z.string().nullable().optional(),
            explanation_mr: z.string().nullable().optional(),
            tags: z.array(z.string()).optional(),
            class_level: z.string().nullable().optional(),
            marks: z.number().int().positive().optional(),
            is_active: z.boolean().optional(),
        });

        const parsed = createQuestionSchema.safeParse(body);

        if (!parsed.success) {
            return ApiErrors.validationError(parsed.error.issues[0].message);
        }

        const rlsContext = {
            userId: authResult.user.id,
            role: authResult.profile.role,
            email: authResult.user.email,
        };

        const result = await QuestionsService.create(slug, {
            questionText: parsed.data.question_text,
            questionLanguage: parsed.data.question_language,
            questionType: parsed.data.question_type,
            difficulty: parsed.data.difficulty,
            chapterId: parsed.data.chapter_id || null,
            answerData: parsed.data.answer_data,
            explanation: parsed.data.explanation || null,
            tags: parsed.data.tags || [],
            classLevel: parsed.data.class_level, // Required
            marks: parsed.data.marks || 1,
            isActive: parsed.data.is_active ?? true,
            createdBy: authResult.user.id,
        }, rlsContext);

        if (!result.success) {
            return ApiErrors.serverError('Failed to create question');
        }

        return successResponse({
            id: result.data.id,
            question_text: result.data.questionText,
            question_language: result.data.questionLanguage,
            question_type: result.data.questionType,
            difficulty: result.data.difficulty,
        });
    } catch (error) {
        console.error('[API] Create question error:', error);
        return ApiErrors.serverError('Failed to create question');
    }
}
