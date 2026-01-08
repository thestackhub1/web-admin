/**
 * POST /api/v1/subjects/[slug]/questions/by-ids
 * 
 * Get questions by their IDs for a specific subject.
 * Used by the mobile app to fetch questions for scheduled exams.
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { QuestionsService } from '@/lib/services';
import { isSubjectSupported } from '@/lib/services/questions.service';

type Params = { params: Promise<{ slug: string }> };

export async function POST(request: NextRequest, context: Params) {
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

        // Parse request body
        let body: { question_ids?: string[] };
        try {
            body = await request.json();
        } catch {
            return ApiErrors.badRequest('Invalid JSON body');
        }

        const { question_ids } = body;

        if (!question_ids || !Array.isArray(question_ids) || question_ids.length === 0) {
            return ApiErrors.badRequest('question_ids array is required and cannot be empty');
        }

        // Limit to prevent abuse
        if (question_ids.length > 100) {
            return ApiErrors.badRequest('Maximum 100 question IDs allowed per request');
        }

        // Use service to fetch questions by IDs
        const questions = await QuestionsService.getByIds(
            slug,
            question_ids,
            {
                userId: authResult.user.id,
                role: authResult.profile.role,
                email: authResult.user.email,
            }
        );

        // Preserve the order of question_ids in the response
        const questionMap = new Map(questions.map(q => [q.id, q]));
        const orderedQuestions = question_ids
            .map(id => questionMap.get(id))
            .filter(Boolean);

        // Return questions array directly for compatibility with mobile app
        return successResponse(orderedQuestions);
    } catch (error) {
        console.error('[API] Questions by IDs error:', error);
        return ApiErrors.serverError('Failed to fetch questions');
    }
}
