/**
 * GET /api/v1/schools/suggest
 * 
 * Get popular/common schools (for suggestions during signup).
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { SchoolsService } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    // Allow any authenticated user to get suggestions
    const authResult = await authenticateRequest(request, { requireStudent: false });
    if (!isAuthContext(authResult)) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const query = searchParams.get('q') || '';

    const rlsContext = {
      userId: authResult.user.id,
      role: authResult.profile.role,
      email: authResult.user.email,
    };

    // Use service to get suggestions
    const suggestions = await SchoolsService.suggest(
      query || 'a', // Provide a minimal query if none provided
      Math.min(limit, 20),
      rlsContext
    );

    return successResponse(suggestions);
  } catch (error) {
    console.error('[API] School suggestions error:', error);
    return ApiErrors.serverError('Failed to fetch school suggestions');
  }
}
