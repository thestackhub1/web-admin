/**
 * POST /api/v1/schools
 * GET /api/v1/schools
 * 
 * Create a new school or get schools list.
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { SchoolsService } from '@/lib/services';
import { z } from 'zod';

const createSchoolSchema = z.object({
  name: z.string().min(1, 'School name is required').max(200, 'School name is too long'),
  location_city: z.string().max(100).optional().nullable(),
  location_state: z.string().max(100).optional().nullable(),
  location_country: z.string().max(100).optional().default('India'),
});

/**
 * POST - Create a new school
 */
export async function POST(request: NextRequest) {
  try {
    // Only authenticated users can create schools
    const authResult = await authenticateRequest(request, { requireStudent: false });
    if (!isAuthContext(authResult)) {
      return authResult;
    }

    const body = await request.json();

    // Validate input
    const parsed = createSchoolSchema.safeParse(body);
    if (!parsed.success) {
      return ApiErrors.validationError(parsed.error.issues[0].message);
    }

    const { name, location_city, location_state, location_country } = parsed.data;

    const rlsContext = {
      userId: authResult.user.id,
      role: authResult.profile.role,
      email: authResult.user.email,
    };

    // Check for duplicates
    const existingSchool = await SchoolsService.findDuplicate(
      name,
      location_city,
      location_state,
      rlsContext
    );

    if (existingSchool) {
      // Return existing school instead of creating duplicate
      return successResponse({
        id: existingSchool.id,
        name: existingSchool.name,
        location_city: existingSchool.locationCity,
        location_state: existingSchool.locationState,
        is_duplicate: true,
        message: 'School already exists',
      });
    }

    // Create new school
    try {
      const school = await SchoolsService.create(
        {
          name: name.trim(),
          locationCity: location_city?.trim(),
          locationState: location_state?.trim(),
          locationCountry: location_country || 'India',
          createdBy: authResult.user.id,
        },
        rlsContext
      );

      return successResponse({
        ...school,
        is_duplicate: false,
        message: 'School created successfully',
      }, 201);
    } catch (error: any) {
      // Handle unique constraint violation
      if (error.code === '23505' || error.message?.includes('duplicate')) {
        const duplicateSchool = await SchoolsService.findDuplicate(
          name,
          location_city,
          location_state,
          rlsContext
        );

        if (duplicateSchool) {
          return successResponse({
            id: duplicateSchool.id,
            name: duplicateSchool.name,
            location_city: duplicateSchool.locationCity,
            location_state: duplicateSchool.locationState,
            is_duplicate: true,
            message: 'School already exists',
          });
        }
      }

      throw error;
    }
  } catch (error) {
    console.error('[API] School creation error:', error);
    return ApiErrors.serverError('Failed to create school');
  }
}

/**
 * GET - Get schools list (with pagination)
 */
export async function GET(request: NextRequest) {
  try {
    // Allow any authenticated user to view schools
    const authResult = await authenticateRequest(request, { requireStudent: false });
    if (!isAuthContext(authResult)) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const verified = searchParams.get('verified');
    const search = searchParams.get('search');
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const userAdded = searchParams.get('userAdded');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const rlsContext = {
      userId: authResult.user.id,
      role: authResult.profile.role,
      email: authResult.user.email,
    };

    // Prepare options for service
    const options: any = {
      page,
      pageSize,
      search: search || undefined,
      locationCity: city || undefined,
      locationState: state || undefined,
    };

    if (verified === 'true') {
      options.isVerified = true;
    } else if (verified === 'false') {
      options.isVerified = false;
    }

    if (userAdded === 'true') {
      options.isUserAdded = true;
    } else if (userAdded === 'false') {
      options.isUserAdded = false;
    }

    const result = await SchoolsService.getAll(options, rlsContext);

    return successResponse(result);
  } catch (error) {
    console.error('[API] Schools list error:', error);
    return ApiErrors.serverError('Failed to fetch schools');
  }
}
