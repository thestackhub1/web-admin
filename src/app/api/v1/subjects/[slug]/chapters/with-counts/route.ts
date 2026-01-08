/**
 * GET /api/v1/subjects/[slug]/chapters/with-counts
 * 
 * Get chapters for a subject with question counts per chapter.
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { ChaptersService, QuestionsService } from '@/lib/services';
import { isSubjectSupported } from '@/lib/services/questions.service';

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

        // Get chapters
        const chapters = await ChaptersService.getBySubjectSlug(slug);

        if (chapters.length === 0) {
            return successResponse([]);
        }

        // Get question counts for each chapter
        const chaptersWithCounts = await Promise.all(
            chapters.map(async (chapter) => {
                try {
                    const questions = await QuestionsService.getBySubject(
                        slug,
                        {
                            chapterId: chapter.id,
                            isActive: true,
                            limit: 1000,
                        },
                        {
                            userId: authResult.user.id,
                            role: authResult.profile.role,
                            email: authResult.user.email,
                        }
                    );

                    return {
                        id: chapter.id,
                        name_en: chapter.nameEn,
                        name_mr: chapter.nameMr,
                        description_en: chapter.descriptionEn,
                        description_mr: chapter.descriptionMr,
                        order_index: chapter.orderIndex,
                        question_count: questions.length,
                    };
                } catch (error) {
                    console.warn(`Could not get question count for chapter ${chapter.id}:`, error);
                    return {
                        id: chapter.id,
                        name_en: chapter.nameEn,
                        name_mr: chapter.nameMr,
                        description_en: chapter.descriptionEn,
                        description_mr: chapter.descriptionMr,
                        order_index: chapter.orderIndex,
                        question_count: 0,
                    };
                }
            })
        );

        return successResponse(chaptersWithCounts);
    } catch (error) {
        console.error('[API] Chapters with counts error:', error);
        return ApiErrors.serverError('Failed to fetch chapters with question counts');
    }
}


