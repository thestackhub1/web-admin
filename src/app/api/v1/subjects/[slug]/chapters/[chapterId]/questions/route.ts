/**
 * GET /api/v1/subjects/[slug]/chapters/[chapterId]/questions
 * 
 * Get practice questions for a specific chapter.
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { QuestionsService } from '@/lib/services';
import { isSubjectSupported } from '@/lib/services/questions.service';

type Params = { params: Promise<{ slug: string; chapterId: string }> };

export async function GET(request: NextRequest, context: Params) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const { slug, chapterId } = await context.params;
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || undefined;
        const limit = parseInt(searchParams.get('limit') || '50');

        if (!slug || !chapterId) {
            return ApiErrors.badRequest('Subject slug and chapter ID are required');
        }

        // Check if subject is supported
        if (!isSubjectSupported(slug)) {
            return ApiErrors.notFound(`Subject '${slug}' not found or not supported`);
        }

        // Use service to fetch questions
        const questions = await QuestionsService.getBySubject(
            slug,
            {
                chapterId,
                questionType: type,
                isActive: true,
                limit: Math.min(limit, 100),
            },
            {
                userId: authResult.user.id,
                role: authResult.profile.role,
                email: authResult.user.email,
            }
        );

        return successResponse(questions);
    } catch (error) {
        console.error('[API] Chapter questions error:', error);
        return ApiErrors.serverError('Failed to fetch questions');
    }
}
