/**
 * GET /api/v1/subjects/[slug]/chapters/[chapterId]/question-counts
 * 
 * Get question counts by type for a specific chapter.
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

        if (!slug || !chapterId) {
            return ApiErrors.badRequest('Subject slug and chapter ID are required');
        }

        // Check if subject is supported
        if (!isSubjectSupported(slug)) {
            return ApiErrors.notFound(`Subject '${slug}' not found or not supported`);
        }

        // Use service to get question counts
        const counts = await QuestionsService.getQuestionCountsByChapter(
            slug,
            chapterId,
            {
                userId: authResult.user.id,
                role: authResult.profile.role,
                email: authResult.user.email,
            }
        );

        // Transform to API format
        const total = Object.values(counts).reduce((sum, typeCounts) => {
            return sum + Object.values(typeCounts).reduce((s, c) => s + c, 0);
        }, 0);

        return successResponse({
            counts,
            total,
            mcq: (counts['easy']?.['mcq_single'] || 0) + (counts['medium']?.['mcq_single'] || 0) + (counts['hard']?.['mcq_single'] || 0),
            mcq_single: (counts['easy']?.['mcq_single'] || 0) + (counts['medium']?.['mcq_single'] || 0) + (counts['hard']?.['mcq_single'] || 0),
            mcq_double: (counts['easy']?.['mcq_two'] || 0) + (counts['medium']?.['mcq_two'] || 0) + (counts['hard']?.['mcq_two'] || 0),
            mcq_triple: (counts['easy']?.['mcq_three'] || 0) + (counts['medium']?.['mcq_three'] || 0) + (counts['hard']?.['mcq_three'] || 0),
            true_false: (counts['easy']?.['true_false'] || 0) + (counts['medium']?.['true_false'] || 0) + (counts['hard']?.['true_false'] || 0),
            fill_blank: (counts['easy']?.['fill_blank'] || 0) + (counts['medium']?.['fill_blank'] || 0) + (counts['hard']?.['fill_blank'] || 0),
            match: (counts['easy']?.['match'] || 0) + (counts['medium']?.['match'] || 0) + (counts['hard']?.['match'] || 0),
            short_answer: (counts['easy']?.['short_answer'] || 0) + (counts['medium']?.['short_answer'] || 0) + (counts['hard']?.['short_answer'] || 0),
            programming: (counts['easy']?.['programming'] || 0) + (counts['medium']?.['programming'] || 0) + (counts['hard']?.['programming'] || 0),
        });
    } catch (error) {
        console.error('[API] Question counts error:', error);
        return ApiErrors.serverError('Failed to fetch question counts');
    }
}
