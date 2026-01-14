/**
 * POST /api/v1/questions/import/commit
 * 
 * Commit reviewed batch to questions table
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { QuestionImportService, QuestionsService } from '@/lib/services';
import { getQuestionTableName } from '@/lib/services/questions.service';
import { getDefaultLanguageForSubject } from '@/client/types/questions';
import { z } from 'zod';

const commitBatchSchema = z.object({
  batchId: z.string().uuid(),
  defaultChapterId: z.string().uuid().optional().nullable(),
  defaultClassLevel: z.string().optional(),
  defaultDifficulty: z.string().optional(),
  defaultMarks: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate - require admin/teacher role
    const authResult = await authenticateRequest(request, { requireStudent: false });
    if (!isAuthContext(authResult)) {
      return authResult;
    }

    // Check if user is admin or teacher
    if (!['admin', 'super_admin', 'teacher'].includes(authResult.profile.role)) {
      return ApiErrors.forbidden('Only admins and teachers can commit batches');
    }

    const body = await request.json();
    const parsed = commitBatchSchema.safeParse(body);

    if (!parsed.success) {
      return ApiErrors.validationError(parsed.error.issues[0].message);
    }

    const { batchId, defaultChapterId, defaultClassLevel, defaultDifficulty, defaultMarks } = parsed.data;

    const rlsContext = {
      userId: authResult.user.id,
      role: authResult.profile.role,
      email: authResult.user.email,
    };

    // Fetch batch using service
    const batch = await QuestionImportService.getBatchById(batchId, rlsContext);

    if (!batch) {
      return ApiErrors.notFound('Batch not found');
    }

    // Check if batch can be imported
    if (batch.status === 'imported') {
      return ApiErrors.badRequest('Batch has already been imported');
    }

    if (!Array.isArray(batch.parsed_questions) || batch.parsed_questions.length === 0) {
      return ApiErrors.badRequest('No questions in batch to import');
    }

    // Validate subject
    if (!getQuestionTableName(batch.subject_slug)) {
      return ApiErrors.badRequest(`Invalid subject: ${batch.subject_slug}`);
    }

    // Get default language for subject
    const defaultLanguage = getDefaultLanguageForSubject(batch.subject_slug);

    // Prepare questions for insertion
    const questionsToInsert = batch.parsed_questions.map((q: any) => {
      // Validate question structure - require at least one text field
      if ((!q.questionTextMr && !q.questionTextEn) || !q.options || !Array.isArray(q.options)) {
        throw new Error(`Invalid question structure: ${JSON.stringify(q)}`);
      }

      // Determine primary text and language based on subject
      // For scholarship: prefer Marathi, fallback to English
      // For IT/English: prefer English, fallback to Marathi
      let questionText: string;
      let questionLanguage: "en" | "mr";
      let questionTextSecondary: string | null = null;
      let secondaryLanguage: "en" | "mr" | null = null;

      if (batch.subject_slug === "scholarship") {
        // Scholarship: Marathi is primary
        questionText = q.questionTextMr || q.questionTextEn || '';
        questionLanguage = q.questionTextMr ? "mr" : "en";
        if (q.questionTextEn && q.questionTextMr) {
          questionTextSecondary = q.questionTextEn;
          secondaryLanguage = "en";
        }
      } else {
        // IT/English: English is primary
        questionText = q.questionTextEn || q.questionTextMr || '';
        questionLanguage = q.questionTextEn ? "en" : "mr";
        if (q.questionTextMr && q.questionTextEn) {
          questionTextSecondary = q.questionTextMr;
          secondaryLanguage = "mr";
        }
      }

      // Build answer_data for MCQ - matching the expected format from types
      // For mcq_single: { options: string[], correct: number }
      const answerData: any = {
        options: q.options.map((opt: string) => opt || ''),
        correct: q.correctAnswer !== undefined && q.correctAnswer !== null ? q.correctAnswer : 0,
      };

      return {
        questionText,
        questionLanguage,
        questionTextSecondary,
        secondaryLanguage,
        questionType: q.questionType || 'mcq_single',
        difficulty: q.difficulty || defaultDifficulty || 'medium',
        answerData,
        explanationEn: q.explanationEn || null,
        explanationMr: q.explanationMr || null,
        chapterId: q.chapterId || defaultChapterId || null,
        classLevel: q.classLevel || defaultClassLevel || null,
        marks: q.marks || defaultMarks || 1,
        isActive: true,
        createdBy: authResult.user.id,
      };
    });

    // Insert questions using service
    const insertedQuestions = await QuestionsService.insertQuestions(
      batch.subject_slug,
      questionsToInsert,
      rlsContext
    );

    // Update batch status using service
    await QuestionImportService.updateBatch(
      batchId,
      {
        status: 'imported',
      },
      rlsContext
    );

    return successResponse({
      batchId: batch.id,
      importedCount: insertedQuestions.length,
      totalCount: questionsToInsert.length,
    });
  } catch (error: any) {
    console.error('[API] Commit error:', error);
    return ApiErrors.serverError(error.message || 'Failed to commit batch');
  }
}
