/**
 * GET /api/v1/subjects/[slug]/exam-structure
 * 
 * Get exam structure for a subject by slug or ID.
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { SubjectsService, ExamStructuresService } from '@/lib/services';

type Params = { params: Promise<{ slug: string }> };

// Standard section types for IT exams (Maharashtra Board pattern)
const DEFAULT_SECTIONS = [
    { name: 'Q1 - Fill in Blanks', question_type: 'fill_blank', questions: 5, marks: 5, duration_minutes: 8 },
    { name: 'Q2 - True/False', question_type: 'true_false', questions: 5, marks: 5, duration_minutes: 8 },
    { name: 'Q3 - MCQ (1 Mark)', question_type: 'mcq_single', questions: 5, marks: 5, duration_minutes: 10 },
    { name: 'Q4 - MCQ (2 Marks)', question_type: 'mcq_double', questions: 5, marks: 10, duration_minutes: 15 },
    { name: 'Q5 - MCQ (3 Marks)', question_type: 'mcq_triple', questions: 5, marks: 15, duration_minutes: 20 },
    { name: 'Q6 - Match Columns', question_type: 'match', questions: 5, marks: 10, duration_minutes: 15 },
    { name: 'Q7 - Short Answer', question_type: 'short_answer', questions: 4, marks: 16, duration_minutes: 30 },
    { name: 'Q8 - Programming', question_type: 'programming', questions: 3, marks: 24, duration_minutes: 44 },
];

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

        // Check if slug is UUID or actual slug
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        let subjectId = slug;

        if (!uuidPattern.test(slug)) {
            // It's a slug, get subject first
            const subject = await SubjectsService.getBySlug(slug);
            if (!subject) {
                return ApiErrors.notFound('Subject not found');
            }
            subjectId = subject.id;
        }

        // Use service to get exam structures for this subject
        const examStructures = await ExamStructuresService.getAll({ subjectId });

        // Get the most recent one (they're already ordered)
        const examStructure = examStructures.length > 0 ? examStructures[0] : null;

        if (!examStructure) {
            // No exam structure found - return default structure
            return successResponse({
                id: null,
                subject_id: subjectId,
                sections: DEFAULT_SECTIONS,
                duration_minutes: 150,
                total_questions: 37,
                total_marks: 90,
                passing_percentage: 35,
            });
        }

        // Normalize sections to ensure proper format
        let sections = (examStructure.sections as any) || DEFAULT_SECTIONS;

        // If sections exist but don't have proper format, normalize them
        if (Array.isArray(sections) && sections.length > 0) {
            sections = sections.map((sec: any, index: number) => ({
                name: sec.name || sec.section_name || `Section ${index + 1}`,
                question_type: sec.question_type || sec.type || 'mcq_single',
                questions: sec.questions || sec.question_count || sec.count || 5,
                marks: sec.marks || sec.marks_total || sec.total_marks || 5,
                duration_minutes: sec.duration_minutes || sec.duration || 10,
            }));
        } else {
            sections = DEFAULT_SECTIONS;
        }

        return successResponse({
            id: examStructure.id,
            subject_id: examStructure.subject_id,
            name_en: examStructure.name_en,
            name_mr: examStructure.name_mr,
            description_en: examStructure.description_en,
            description_mr: examStructure.description_mr,
            class_level: examStructure.class_level,
            duration_minutes: examStructure.duration_minutes || 150,
            total_questions: examStructure.total_questions || sections.reduce((sum: number, s: any) => sum + (s.questions || 0), 0),
            total_marks: examStructure.total_marks || sections.reduce((sum: number, s: any) => sum + (s.marks || 0), 0),
            passing_percentage: examStructure.passing_percentage,
            sections,
            order_index: examStructure.order_index,
        });
    } catch (error) {
        console.error('[API] Exam structure error:', error);
        return ApiErrors.serverError('Failed to fetch exam structure');
    }
}
