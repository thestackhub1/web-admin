/**
 * GET /api/v1/exams/[id]/answers
 *
 * Get all answers for an exam attempt.
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { ExamsService, QuestionsService, ChaptersService } from '@/lib/services';
import { z } from 'zod';

type Params = { params: Promise<{ id: string }> };

const uuidSchema = z.string().uuid('Invalid exam ID format');

export async function GET(request: NextRequest, context: Params) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const { id } = await context.params;

        const uuidResult = uuidSchema.safeParse(id);
        if (!uuidResult.success) {
            return ApiErrors.badRequest('Invalid exam ID format');
        }

        const rlsContext = {
            userId: authResult.user.id,
            role: authResult.profile.role,
            email: authResult.user.email,
        };

        // Get exam answers using service
        const answers = await ExamsService.getAnswers(id, rlsContext);

        if (answers.length === 0) {
            return successResponse([]);
        }

        // Group question IDs by table
        const questionsByTable: Record<string, string[]> = {};
        for (const answer of answers) {
            const table = answer.questionTable;
            if (!questionsByTable[table]) {
                questionsByTable[table] = [];
            }
            questionsByTable[table].push(answer.questionId);
        }

        // Fetch questions from each table
        const questionsMap: Record<string, any> = {};

        for (const [tableName, questionIds] of Object.entries(questionsByTable)) {
            // Extract subject slug from table name (e.g., "questions_scholarship" -> "scholarship")
            const subjectSlug = tableName.replace('questions_', '').replace(/_/g, '-');
            
            try {
                const questions = await QuestionsService.getByIds(
                    subjectSlug,
                    questionIds,
                    rlsContext
                );

                // Get chapters for questions that have chapter_id
                const chapterIds = questions
                    .map(q => q.chapter_id)
                    .filter((id): id is string => id !== null && id !== undefined);
                
                let chaptersMap: Record<string, any> = {};
                if (chapterIds.length > 0) {
                    const chapterList = await ChaptersService.getByIds(chapterIds, rlsContext);
                    
                    chaptersMap = Object.fromEntries(
                        chapterList.map(ch => [ch.id, { name_en: ch.nameEn, name_mr: ch.nameMr }])
                    );
                }

                // Map questions with chapter info
                for (const q of questions) {
                    questionsMap[q.id] = {
                        id: q.id,
                        question_text: q.question_text,
                        question_language: q.question_language as 'en' | 'mr',
                        question_text_secondary: q.question_text_mr || null,
                        secondary_language: q.question_language === 'en' ? 'mr' : 'en',
                        question_type: q.question_type,
                        answer_data: q.answer_data,
                        marks: q.marks,
                        explanation_en: q.explanation_en || null,
                        explanation_mr: q.explanation_mr || null,
                        chapter: q.chapter_id && chaptersMap[q.chapter_id] 
                            ? chaptersMap[q.chapter_id] 
                            : null,
                    };
                }
            } catch (error) {
                console.warn(`Failed to fetch questions from ${tableName}:`, error);
            }
        }

        // Merge answers with questions
        const transformed = answers.map(answer => ({
            id: answer.id,
            exam_id: answer.examId,
            question_id: answer.questionId,
            question_table: answer.questionTable,
            user_answer: answer.userAnswer,
            is_correct: answer.isCorrect,
            marks_obtained: answer.marksObtained,
            created_at: answer.createdAt?.toISOString() || null,
            question: questionsMap[answer.questionId] || null,
        }));

        return successResponse(transformed);
    } catch (error) {
        console.error('[API] Exam answers error:', error);
        return ApiErrors.serverError('Failed to fetch exam answers');
    }
}

