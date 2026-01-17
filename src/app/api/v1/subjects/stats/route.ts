/**
 * GET /api/v1/subjects/stats
 * 
 * Get aggregate statistics for subjects (categories, root subjects, chapters, questions).
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { SubjectsService, QuestionsService } from '@/lib/services';

export async function GET(request: NextRequest) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request, { requireStudent: false });
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const rlsContext = {
            userId: authResult.user.id,
            role: authResult.profile.role,
            email: authResult.user.email,
        };

        // Get stats using service
        const stats = await SubjectsService.getStats(rlsContext);

        // Get total questions from all question tables
        const _questionCounts = await Promise.all([
            QuestionsService.getBySubject('scholarship', { isActive: true, limit: 1 }),
            QuestionsService.getBySubject('english', { isActive: true, limit: 1 }),
            QuestionsService.getBySubject('information-technology', { isActive: true, limit: 1 }),
        ]);

        // Note: We're only getting 1 question to check if table exists, actual count would need a count query
        // For now, we'll need to get actual counts - let's use a different approach
        // We'll need to add a count method to QuestionsService or query directly
        
        // Get all subjects to calculate question counts properly
        const allSubjects = await SubjectsService.getAll();

        let totalQuestions = 0;
        for (const subject of allSubjects) {
            try {
                const questions = await QuestionsService.getBySubject(
                    subject.slug,
                    { isActive: true, limit: 1000 },
                    {
                        userId: authResult.user.id,
                        role: authResult.profile.role,
                        email: authResult.user.email,
                    }
                );
                totalQuestions += questions.length;
            } catch (error) {
                // Subject might not have questions table, skip
                console.warn(`Could not get questions for subject ${subject.slug}:`, error);
            }
        }

        return successResponse({
            total_categories: stats.totalCategories,
            root_subjects: stats.rootSubjects,
            total_chapters: stats.totalChapters,
            total_questions: totalQuestions,
        });
    } catch (error) {
        console.error('[API] Subjects stats error:', error);
        return ApiErrors.serverError('Failed to fetch subject statistics');
    }
}

