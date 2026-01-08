/**
 * POST /api/v1/questions/import/pdf
 * 
 * Upload PDF file(s) and extract questions using AI-powered extraction
 * Supports multiple AI models with Marathi-optimized extraction
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { QuestionImportService } from '@/lib/services';
import { isSubjectSupported } from '@/lib/services/questions.service';
import { extractQuestionsFromPdf, convertToParsedQuestions } from '@/lib/services/ai';
import { getDefaultModel, getModelConfig, isModelAvailable } from '@/lib/services/ai/providers';
import type { AIModel } from '@/lib/services/ai/types';
import { parsePdfQuestions } from '@/lib/pdf/pdf-parser';

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
    const pdfFile = formData.get('pdf') as File | null;
    const answerKeyFile = formData.get('answerKey') as File | null;
    const subjectSlug = formData.get('subjectSlug') as string | null;
    const batchName = formData.get('batchName') as string | null;
    const useAI = formData.get('useAI') !== 'false'; // Default to true
    const aiModel = (formData.get('aiModel') as string) || getDefaultModel();
    const scholarshipMode = formData.get('scholarshipMode') !== 'false'; // Default to true

    // Validate inputs
    if (!pdfFile) {
      return ApiErrors.badRequest('PDF file is required');
    }

    if (!subjectSlug || !isSubjectSupported(subjectSlug)) {
      return ApiErrors.badRequest('Valid subject slug is required');
    }

    // Validate file type
    if (pdfFile.type !== 'application/pdf') {
      return ApiErrors.badRequest('File must be a PDF');
    }

    // Validate AI model only if AI extraction is enabled
    if (useAI) {
      const validModels: AIModel[] = ['gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet-20241022', 'llama-3.1-70b-versatile'];
      if (!validModels.includes(aiModel as AIModel)) {
        return ApiErrors.badRequest(`Invalid AI model. Must be one of: ${validModels.join(', ')}`);
      }

      if (!isModelAvailable(aiModel as AIModel)) {
        return ApiErrors.badRequest(
          `AI model ${aiModel} is not available. Please check that the required API key is configured.`
        );
      }
    }

    // Convert File to Buffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    let answerKeyBuffer: Buffer | undefined;
    if (answerKeyFile && answerKeyFile.type === 'application/pdf') {
      const answerKeyArrayBuffer = await answerKeyFile.arrayBuffer();
      answerKeyBuffer = Buffer.from(answerKeyArrayBuffer);
    }

    // Extract questions using either AI or legacy parser
    let parsedQuestions: import('@/lib/pdf/pdf-parser').ParsedQuestion[];
    let extractionMetadata: any = {};

    if (useAI) {
      // Use AI-powered extraction
      const extractionResult = await extractQuestionsFromPdf(
        pdfBuffer,
        {
          model: aiModel as AIModel,
          includeEnglish: true,
          strictMode: false,
          scholarshipMode: scholarshipMode, // Enable Maharashtra Scholarship mode
        },
        answerKeyBuffer,
        (progress) => {
          // Log progress for debugging
          console.log(`[PDF Import] ${progress.stage}: ${progress.message} (${progress.percentage}%)`);
        }
      );

      // Convert to ParsedQuestion format for compatibility
      parsedQuestions = convertToParsedQuestions(extractionResult);
      extractionMetadata = extractionResult.metadata;
    } else {
      // Use legacy parser
      console.log('[PDF Import] Using legacy parser (non-AI)');
      parsedQuestions = await parsePdfQuestions(pdfBuffer, answerKeyBuffer);
      extractionMetadata = {
        extractionMethod: 'legacy',
        parsedCount: parsedQuestions.length,
      };
    }

    if (parsedQuestions.length === 0) {
      return ApiErrors.badRequest('No questions found in PDF. Please check the PDF format.');
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
        batchName: batchName || `Import ${new Date().toLocaleDateString()}`,
        parsedQuestions,
        metadata: {
          fileName: pdfFile.name,
          fileSize: pdfFile.size,
          hasAnswerKey: !!answerKeyFile,
          answerKeyFileName: answerKeyFile?.name,
          uploadedAt: new Date().toISOString(),
          parsedCount: parsedQuestions.length,
          useAI: useAI,
          aiModel: useAI ? aiModel : null,
          extractionMetadata: extractionMetadata,
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
      metadata: extractionMetadata,
      useAI: useAI,
    });
  } catch (error: any) {
    console.error('[API] PDF import error:', error);
    
    // Provide user-friendly error messages
    if (error.message?.includes('API key')) {
      return ApiErrors.serverError('AI service configuration error. Please check API keys.');
    }
    
    if (error.message?.includes('No text could be extracted')) {
      return ApiErrors.badRequest('Could not extract text from PDF. The PDF may be image-based or corrupted. Please try OCR preprocessing.');
    }

    return ApiErrors.serverError(error.message || 'Failed to process PDF');
  }
}

