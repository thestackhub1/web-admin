/**
 * POST /api/v1/questions/import/csv
 * 
 * Import questions from CSV or Excel file
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { QuestionImportService } from '@/lib/services';
import { isSubjectSupported } from '@/lib/services/questions.service';
import * as XLSX from 'xlsx';
import type { ParsedQuestion } from '@/lib/pdf/pdf-parser';

export async function POST(request: NextRequest) {
  try {
    // Authenticate - require admin/teacher role
    const authResult = await authenticateRequest(request, { requireStudent: false });
    if (!isAuthContext(authResult)) {
      return authResult;
    }

    // Check if user is admin or teacher
    if (!['admin', 'super_admin', 'teacher'].includes(authResult.profile.role)) {
      return ApiErrors.forbidden('Only admins and teachers can import questions');
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const subjectSlug = formData.get('subjectSlug') as string | null;
    const batchName = formData.get('batchName') as string | null;

    if (!file) {
      return ApiErrors.badRequest('File is required');
    }

    if (!subjectSlug || !isSubjectSupported(subjectSlug)) {
      return ApiErrors.badRequest('Valid subject slug is required');
    }

    // Validate file type
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (!validTypes.includes(file.type)) {
      return ApiErrors.badRequest('File must be CSV or Excel format');
    }

    // Read file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse file based on type
    let data: any[];
    try {
      if (file.type === 'text/csv') {
        // Parse CSV
        const workbook = XLSX.read(buffer, { type: 'buffer', raw: true });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(worksheet);
      } else {
        // Parse Excel
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(worksheet);
      }
    } catch (parseError) {
      console.error('[API] File parse error:', parseError);
      return ApiErrors.badRequest('Failed to parse file. Please check the format.');
    }

    if (!data || data.length === 0) {
      return ApiErrors.badRequest('No data found in file');
    }

    // Transform data to parsed questions format
    const parsedQuestions: ParsedQuestion[] = data.map((row: any, index: number) => {
      // Map common column names (case-insensitive)
      const getValue = (keys: string[]): string => {
        for (const key of keys) {
          const value = row[key] || row[key.toLowerCase()] || row[key.toUpperCase()];
          if (value) return String(value).trim();
        }
        return '';
      };

      const questionTextMr = getValue(['Question (Marathi)', 'question_mr', 'questionTextMr', 'Question Marathi']);
      const questionTextEn = getValue(['Question (English)', 'question_en', 'questionTextEn', 'Question English']);
      const optionA = getValue(['Option A (Marathi)', 'option_a', 'optionA', 'A']);
      const optionB = getValue(['Option B (Marathi)', 'option_b', 'optionB', 'B']);
      const optionC = getValue(['Option C (Marathi)', 'option_c', 'optionC', 'C']);
      const optionD = getValue(['Option D (Marathi)', 'option_d', 'optionD', 'D']);
      const correctAnswerStr = getValue(['Correct Answer', 'correct_answer', 'correctAnswer', 'Correct']);
      const difficulty = getValue(['Difficulty', 'difficulty']) || 'medium';
      const marks = parseInt(getValue(['Marks', 'marks']) || '1');
      const questionType = getValue(['Type', 'type', 'question_type', 'questionType']) || 'mcq_single';

      // Parse correct answer (could be index 0-3 or letter A-D)
      let correctAnswer: number | undefined;
      if (correctAnswerStr) {
        if (/^[0-3]$/.test(correctAnswerStr)) {
          correctAnswer = parseInt(correctAnswerStr);
        } else if (/^[A-D]$/i.test(correctAnswerStr)) {
          correctAnswer = correctAnswerStr.toUpperCase().charCodeAt(0) - 65;
        }
      }

      const options = [optionA, optionB, optionC, optionD].filter(Boolean);
      
      const parsingErrors: string[] = [];
      if (!questionTextMr) {
        parsingErrors.push('Missing question text (Marathi)');
      }
      if (options.length < 4) {
        parsingErrors.push(`Expected 4 options, found ${options.length}`);
      }

      return {
        questionNumber: index + 1,
        questionTextMr: questionTextMr || `Question ${index + 1}`,
        questionTextEn: questionTextEn || '',
        options: options.length === 4 ? options : [...options, ...Array(4 - options.length).fill('')],
        correctAnswer,
        questionType,
        difficulty: ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium',
        marks: isNaN(marks) ? 1 : marks,
        parsingErrors: parsingErrors.length > 0 ? parsingErrors : undefined,
      };
    }).filter((q) => q.questionTextMr && q.questionTextMr !== ''); // Filter out empty questions

    if (parsedQuestions.length === 0) {
      return ApiErrors.badRequest('No valid questions found in file');
    }

    // Save to database as draft batch using service
    const rlsContext = {
      userId: authResult.user.id,
      role: authResult.profile.role,
      email: authResult.user.email,
    };

    const batch = await QuestionImportService.createBatch(
      {
        subjectSlug,
        batchName: batchName || `Import from ${file.name}`,
        parsedQuestions,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadedAt: new Date().toISOString(),
          parsedCount: parsedQuestions.length,
          importType: 'csv',
        },
        createdBy: authResult.user.id,
      },
      rlsContext
    );

    return successResponse({
      batchId: batch.id,
      batchName: batch.batch_name,
      questionsCount: parsedQuestions.length,
      questions: parsedQuestions,
    });
  } catch (error: any) {
    console.error('[API] CSV import error:', error);
    return ApiErrors.serverError(error.message || 'Failed to process file');
  }
}




