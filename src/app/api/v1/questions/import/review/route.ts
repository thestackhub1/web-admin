/**
 * POST /api/v1/questions/import/review
 * 
 * Save draft batch with reviewed/edited questions
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { QuestionImportService } from '@/lib/services';
import { z } from 'zod';

const reviewBatchSchema = z.object({
  batchId: z.string().uuid(),
  questions: z.array(z.any()), // Parsed questions array
  batchName: z.string().optional(),
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
      return ApiErrors.forbidden('Only admins and teachers can save review batches');
    }

    const body = await request.json();
    const parsed = reviewBatchSchema.safeParse(body);

    if (!parsed.success) {
      return ApiErrors.validationError(parsed.error.issues[0].message);
    }

    const { batchId, questions, batchName } = parsed.data;

    const rlsContext = {
      userId: authResult.user.id,
      role: authResult.profile.role,
      email: authResult.user.email,
    };

    // Verify batch exists and belongs to user or is accessible
    const existingBatch = await QuestionImportService.getBatchById(batchId, rlsContext);

    if (!existingBatch) {
      return ApiErrors.notFound('Batch not found');
    }

    // Check if user can modify this batch (must be creator or admin)
    if (
      existingBatch.created_by !== authResult.user.id &&
      !['admin', 'super_admin'].includes(authResult.profile.role)
    ) {
      return ApiErrors.forbidden('You can only modify batches you created');
    }

    // Update batch using service
    const updatedBatch = await QuestionImportService.updateBatch(
      batchId,
      {
        parsedQuestions: questions,
        status: 'reviewed',
        batchName,
      },
      rlsContext
    );

    if (!updatedBatch) {
      return ApiErrors.serverError('Failed to save review');
    }

    return successResponse({
      batchId: updatedBatch.id,
      status: updatedBatch.status,
      questionsCount: questions.length,
    });
  } catch (error: any) {
    console.error('[API] Review save error:', error);
    return ApiErrors.serverError(error.message || 'Failed to save review');
  }
}




