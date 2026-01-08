/**
 * GET /api/v1/schools/search
 * 
 * Search schools by name and location (fuzzy search).
 * Query params: q (search query), city, state, limit
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { SchoolsService } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    // Authenticate (allow any authenticated user to search)
    const authResult = await authenticateRequest(request, { requireStudent: false });
    if (!isAuthContext(authResult)) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (!query.trim()) {
      return ApiErrors.badRequest('Search query (q) is required');
    }

    const rlsContext = {
      userId: authResult.user.id,
      role: authResult.profile.role,
      email: authResult.user.email,
    };

    // Use service to search schools
    const schools = await SchoolsService.search(
      query,
      Math.min(limit, 50), // Cap at 50
      rlsContext
    );

    return successResponse(schools);
  } catch (error) {
    console.error('[API] School search error:', error);
    return ApiErrors.serverError('Failed to search schools');
  }
}
