/**
 * GET /api/v1/schools/[id]
 * PUT /api/v1/schools/[id]
 * DELETE /api/v1/schools/[id]
 * 
 * Get, update, or delete a school (admin only for update/delete).
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { SchoolsService } from '@/lib/services';
import { z } from 'zod';

type Params = { params: Promise<{ id: string }> };

const updateSchoolSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  location_city: z.string().max(100).optional().nullable(),
  location_state: z.string().max(100).optional().nullable(),
  location_country: z.string().max(100).optional(),
  is_verified: z.boolean().optional(),
});

/**
 * GET - Get school by ID
 */
export async function GET(request: NextRequest, context: Params) {
  try {
    // Allow any authenticated user to view schools
    const authResult = await authenticateRequest(request, { requireStudent: false });
    if (!isAuthContext(authResult)) {
      return authResult;
    }

    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const includeStudentCount = searchParams.get('includeStudentCount') === 'true';

    const rlsContext = {
      userId: authResult.user.id,
      role: authResult.profile.role,
      email: authResult.user.email,
    };

    // Use service to fetch school (with or without real-time student count)
    const school = includeStudentCount 
      ? await SchoolsService.getByIdWithStudentCount(id, rlsContext)
      : await SchoolsService.getById(id, rlsContext);

    if (!school) {
      return ApiErrors.notFound('School not found');
    }

    return successResponse(school);
  } catch (error) {
    console.error('[API] School fetch error:', error);
    return ApiErrors.serverError('Failed to fetch school');
  }
}

/**
 * PUT - Update school (admin only)
 */
export async function PUT(request: NextRequest, context: Params) {
  try {
    // Only admins can update schools
    const authResult = await authenticateRequest(request, { requireStudent: false });
    if (!isAuthContext(authResult)) {
      return authResult;
    }

    // Check if user is admin
    if (!['admin', 'super_admin'].includes(authResult.profile.role)) {
      return ApiErrors.forbidden('Only admins can update schools');
    }

    const { id } = await context.params;
    const body = await request.json();

    // Validate input
    const parsed = updateSchoolSchema.safeParse(body);
    if (!parsed.success) {
      return ApiErrors.validationError(parsed.error.issues[0].message);
    }

    const updates = parsed.data;

    const rlsContext = {
      userId: authResult.user.id,
      role: authResult.profile.role,
      email: authResult.user.email,
    };

    // Use service to update school
    const school = await SchoolsService.update(
      id,
      {
        name: updates.name,
        locationCity: updates.location_city ?? undefined,
        locationState: updates.location_state ?? undefined,
        locationCountry: updates.location_country,
        isVerified: updates.is_verified,
      },
      rlsContext
    );

    if (!school) {
      return ApiErrors.notFound('School not found');
    }

    return successResponse(school);
  } catch (error) {
    console.error('[API] School update error:', error);
    return ApiErrors.serverError('Failed to update school');
  }
}

/**
 * DELETE - Delete school (admin only, with safety checks)
 */
export async function DELETE(request: NextRequest, context: Params) {
  try {
    // Only admins can delete schools
    const authResult = await authenticateRequest(request, { requireStudent: false });
    if (!isAuthContext(authResult)) {
      return authResult;
    }

    // Check if user is admin
    if (!['admin', 'super_admin'].includes(authResult.profile.role)) {
      return ApiErrors.forbidden('Only admins can delete schools');
    }

    const { id } = await context.params;

    const rlsContext = {
      userId: authResult.user.id,
      role: authResult.profile.role,
      email: authResult.user.email,
    };

    // Check if school has students (safety check) using service
    const studentCount = await SchoolsService.getStudentCount(id, rlsContext);

    if (studentCount > 0) {
      return ApiErrors.badRequest(
        `Cannot delete school with ${studentCount} students. Please merge or reassign students first.`
      );
    }

    // Delete school using service
    await SchoolsService.delete(id, rlsContext);

    return successResponse({ message: 'School deleted successfully' });
  } catch (error) {
    console.error('[API] School deletion error:', error);
    return ApiErrors.serverError('Failed to delete school');
  }
}
