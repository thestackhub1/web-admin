/**
 * GET /api/v1/subjects/[slug]/section-practice
 * 
 * Get questions for section practice (by question type across all chapters).
 * Dynamically maps section codes to question types from exam structure.
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { QuestionsService, SubjectsService, ExamStructuresService } from '@/lib/services';
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
        const { searchParams } = new URL(request.url);
        const section = searchParams.get('section');
        const count = parseInt(searchParams.get('count') || '20');

        if (!slug) {
            return ApiErrors.badRequest('Subject slug is required');
        }

        if (!section) {
            return ApiErrors.badRequest('Section name is required');
        }

        // Check if subject is supported
        if (!isSubjectSupported(slug)) {
            return ApiErrors.notFound(`Subject '${slug}' not found or not supported`);
        }

        // Get subject to find exam structure
        const subject = await SubjectsService.getBySlug(slug);
        if (!subject) {
            return ApiErrors.notFound('Subject not found');
        }

        // Get exam structure to map section to question type
        let questionType: string | null = null;
        const examStructures = await ExamStructuresService.getAll({ subjectId: subject.id });
        const examStructure = examStructures.length > 0 ? examStructures[0] : null;

        if (examStructure?.sections && Array.isArray(examStructure.sections)) {
            const sectionLower = section.toLowerCase();
            const matchingSection = examStructure.sections.find(
                (s: any) => (s.code || '').toLowerCase() === sectionLower
            );
            if (matchingSection?.question_type) {
                questionType = matchingSection.question_type;
            }
        }

        // Fallback: legacy mapping
        if (!questionType) {
            const sectionToType: Record<string, string> = {
                'Q1': 'fill_blank',
                'Q2': 'true_false',
                'Q3': 'mcq_single',
                'Q4': 'mcq_double',
                'Q5': 'mcq_triple',
                'Q6': 'match',
                'Q7': 'short_answer',
                'Q8': 'programming',
                'fill_blank': 'fill_blank',
                'true_false': 'true_false',
                'mcq_single': 'mcq_single',
                'mcq_double': 'mcq_double',
                'mcq_triple': 'mcq_triple',
                'match': 'match',
                'short_answer': 'short_answer',
                'programming': 'programming',
                'Section 1': 'fill_blank',
                'Section 2': 'true_false',
                'Section 3': 'mcq_single',
                'Section 4': 'mcq_double',
                'Section 5': 'mcq_triple',
                'Section 6': 'match',
                'Section 7': 'short_answer',
                'Section 8': 'programming',
            };

            questionType = sectionToType[section] || section;
        }

        // Normalize question type
        const typeMapping: Record<string, string> = {
            'mcq_two': 'mcq_double',
            'mcq_three': 'mcq_triple',
            'tf': 'true_false',
            'fib': 'fill_blank',
            'sa_brief': 'short_answer',
            'html_code': 'programming',
        };

        questionType = typeMapping[questionType] || questionType;

        // Use service to fetch questions
        const questions = await QuestionsService.getForSectionPractice(
            slug,
            section,
            count,
            {
                userId: authResult.user.id,
                role: authResult.profile.role,
                email: authResult.user.email,
            }
        );

        return successResponse(questions);
    } catch (error) {
        console.error('[API] Section practice error:', error);
        return ApiErrors.serverError('Failed to fetch questions');
    }
}
