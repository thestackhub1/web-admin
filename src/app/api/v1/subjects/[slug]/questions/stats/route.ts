/**
 * GET /api/v1/subjects/[slug]/questions/stats
 *
 * Get question statistics for a subject (total, by difficulty, by type, chapter counts).
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { QuestionsService, ChaptersService } from '@/lib/services';

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

        const rlsContext = {
            userId: authResult.user.id,
            role: authResult.profile.role,
            email: authResult.user.email,
        };

        // Get all questions for the subject
        const questions = await QuestionsService.getBySubject(
            slug,
            { isActive: true, limit: 10000 }, // Get all for stats
            rlsContext
        );

        // Calculate stats
        const total = questions.length;
        const withChapter = questions.filter(q => q.chapter_id).length;
        const withoutChapter = questions.filter(q => !q.chapter_id).length;

        const byDifficulty: Record<string, number> = {};
        const byType: Record<string, number> = {};

        questions.forEach(q => {
            byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] || 0) + 1;
            byType[q.question_type] = (byType[q.question_type] || 0) + 1;
        });

        // Get chapters with counts
        const chapters = await ChaptersService.getBySubjectSlug(slug);
        const chaptersWithCounts = await Promise.all(
            chapters.map(async (chapter) => {
                const chapterQuestions = questions.filter(q => q.chapter_id === chapter.id);
                return {
                    id: chapter.id,
                    name_en: chapter.nameEn,
                    name_mr: chapter.nameMr,
                    description_en: chapter.descriptionEn,
                    description_mr: chapter.descriptionMr,
                    order_index: chapter.orderIndex,
                    question_count: chapterQuestions.length,
                };
            })
        );

        return successResponse({
            total,
            with_chapter: withChapter,
            without_chapter: withoutChapter,
            by_difficulty: byDifficulty,
            by_type: byType,
            chapters: chaptersWithCounts,
        });
    } catch (error) {
        console.error('[API] Question stats error:', error);
        return ApiErrors.serverError('Failed to fetch question statistics');
    }
}


