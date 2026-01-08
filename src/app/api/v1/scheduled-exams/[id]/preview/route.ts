/**
 * GET /api/v1/scheduled-exams/[id]/preview
 *
 * Get exam preview with sanitized questions (for admin/teacher preview).
 * Questions are sanitized to hide correct answers.
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { ScheduledExamsService, QuestionsService } from '@/lib/services';
import { getQuestionTableName } from '@/lib/services/questions.service';
import { z } from 'zod';

type Params = { params: Promise<{ id: string }> };

const uuidSchema = z.string().uuid('Invalid exam ID format');

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Sanitize question for preview - hide correct answers but show question structure
 */
function sanitizeQuestionForPreview(question: any) {
    const { answer_data, ...rest } = question;

    // Keep options for MCQ but hide correct_answer
    if (answer_data?.options) {
        return {
            ...rest,
            answer_data: {
                options: answer_data.options,
                type: answer_data.type,
            },
        };
    }

    // For true/false, keep type info only
    if (answer_data?.type === "true_false" || rest.question_type === "true_false") {
        return {
            ...rest,
            answer_data: { type: "true_false" },
        };
    }

    // For fill in blanks, keep blank count
    if (answer_data?.blanks) {
        return {
            ...rest,
            answer_data: { blank_count: answer_data.blanks?.length || 1 },
        };
    }

    // For match type, keep left and right columns but shuffle right
    if (answer_data?.pairs) {
        const pairs = answer_data.pairs || [];
        return {
            ...rest,
            answer_data: {
                type: "match",
                left_column: pairs.map((p: any) => p.left),
                right_column: shuffleArray(pairs.map((p: any) => p.right)),
            },
        };
    }

    // For short/long answer and programming, just show the question
    return rest;
}

interface ChapterQuestionConfig {
    chapter_id: string;
    question_count: number;
}

interface Section {
    id: string;
    code: string;
    name_en: string;
    name_mr?: string;
    question_type: string;
    question_count: number;
    marks_per_question: number;
    total_marks: number;
    instructions_en?: string;
    instructions_mr?: string;
    order_index: number;
    chapter_ids?: string[];
    chapter_configs?: ChapterQuestionConfig[];
}

interface ExamSection extends Section {
    questions: any[];
}

export async function GET(request: NextRequest, context: Params) {
    try {
        // Authenticate - require admin/teacher role
        const authResult = await authenticateRequest(request, {
            allowedRoles: ['admin', 'teacher', 'super_admin']
        });
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

        // Get scheduled exam with structure and subject
        const exam = await ScheduledExamsService.getById(id, rlsContext);

        if (!exam) {
            return ApiErrors.notFound('Scheduled exam not found');
        }

        if (!exam.exam_structures) {
            return ApiErrors.badRequest('No exam structure assigned to this exam');
        }

        const structure = exam.exam_structures as any;
        const sections: Section[] = structure.sections || [];

        if (!exam.subjects) {
            return ApiErrors.badRequest('Subject not found for this exam');
        }

        const subject = exam.subjects as any;
        const subjectSlug = subject.slug;

        // Get question table name
        const tableName = getQuestionTableName(subjectSlug);

        if (!tableName) {
            return ApiErrors.badRequest('No question table found for this subject');
        }

        // Build preview sections with questions
        const previewSections: ExamSection[] = [];

        for (const section of sections) {
            const sectionQuestions: any[] = [];

            // Determine chapter configs to use
            const chapterConfigs: ChapterQuestionConfig[] = section.chapter_configs || [];
            const legacyChapterIds: string[] = section.chapter_ids || [];

            if (chapterConfigs.length > 0) {
                // Use chapter_configs for precise per-chapter question selection
                for (const config of chapterConfigs) {
                    if (config.question_count <= 0) continue;

                    const questions = await QuestionsService.getBySubject(
                        subjectSlug,
                        {
                            chapterId: config.chapter_id,
                            questionType: section.question_type,
                            isActive: true,
                            limit: config.question_count * 3, // Fetch extra for randomization
                        },
                        rlsContext
                    );

                    if (questions && questions.length > 0) {
                        const shuffled = shuffleArray(questions);
                        const selected = shuffled.slice(0, config.question_count);
                        sectionQuestions.push(...selected.map(sanitizeQuestionForPreview));
                    }
                }
            } else if (legacyChapterIds.length > 0) {
                // Fallback to legacy chapter_ids - fetch from all chapters
                const allQuestions: any[] = [];
                for (const chapterId of legacyChapterIds) {
                    const questions = await QuestionsService.getBySubject(
                        subjectSlug,
                        {
                            chapterId: chapterId,
                            questionType: section.question_type,
                            isActive: true,
                            limit: section.question_count * 3,
                        },
                        rlsContext
                    );
                    if (questions) {
                        allQuestions.push(...questions);
                    }
                }

                if (allQuestions.length > 0) {
                    const shuffled = shuffleArray(allQuestions);
                    const selected = shuffled.slice(0, section.question_count);
                    sectionQuestions.push(...selected.map(sanitizeQuestionForPreview));
                }
            } else {
                // No chapters specified - fetch from any chapter
                const questions = await QuestionsService.getBySubject(
                    subjectSlug,
                    {
                        questionType: section.question_type,
                        isActive: true,
                        limit: section.question_count * 3,
                    },
                    rlsContext
                );

                if (questions && questions.length > 0) {
                    const shuffled = shuffleArray(questions);
                    const selected = shuffled.slice(0, section.question_count);
                    sectionQuestions.push(...selected.map(sanitizeQuestionForPreview));
                }
            }

            previewSections.push({
                ...section,
                questions: sectionQuestions,
            });
        }

        return successResponse({
            sections: previewSections,
        });
    } catch (error) {
        console.error('[API] Exam preview error:', error);
        return ApiErrors.serverError('Failed to generate exam preview');
    }
}

