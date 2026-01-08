/**
 * GET /api/v1/questions/:subject
 * 
 * Get filtered questions for a subject.
 * Query params: chapter_id, difficulty, type, search, limit, offset
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { QuestionsService } from '@/lib/services';
import { questionsQuerySchema } from '@/lib/api/validators';
import { isSubjectSupported } from '@/lib/services/questions.service';

interface RouteParams {
    params: Promise<{ subject: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const { subject } = await params;

        // Validate subject
        if (!isSubjectSupported(subject)) {
            return ApiErrors.notFound(`Subject '${subject}' not found`);
        }

        // Parse query params
        const url = new URL(request.url);
        const queryParams = {
            chapter_id: url.searchParams.get('chapter_id') || undefined,
            difficulty: url.searchParams.get('difficulty') || undefined,
            type: url.searchParams.get('type') || undefined,
            search: url.searchParams.get('search') || undefined,
            limit: url.searchParams.get('limit') || undefined,
            offset: url.searchParams.get('offset') || undefined,
        };

        const parsed = questionsQuerySchema.safeParse(queryParams);
        if (!parsed.success) {
            return ApiErrors.validationError(parsed.error.issues[0].message);
        }

        const { chapter_id, difficulty, type, limit, offset } = parsed.data;

        // Use service to fetch questions
        const questions = await QuestionsService.getBySubject(
            subject,
            {
                chapterId: chapter_id,
                difficulty,
                questionType: type,
                isActive: true,
                limit,
                offset,
            },
            {
                userId: authResult.user.id,
                role: authResult.profile.role,
                email: authResult.user.email,
            }
        );

        // Get total count for pagination
        const totalCount = await QuestionsService.getCount(
            subject,
            { isActive: true },
            {
                userId: authResult.user.id,
                role: authResult.profile.role,
                email: authResult.user.email,
            }
        );

        return successResponse({
            questions,
            pagination: {
                total: totalCount,
                limit: limit ?? questions.length,
                offset: offset ?? 0,
                has_more: (offset ?? 0) + questions.length < totalCount,
            },
        });
    } catch (error) {
        console.error('[API] Questions error:', error);
        return ApiErrors.serverError('Failed to fetch questions');
    }
}
