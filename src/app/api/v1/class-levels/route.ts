/**
 * GET /api/v1/class-levels
 * 
 * Get all active class levels.
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { ClassLevelsService } from '@/lib/services';

export async function GET(request: NextRequest) {
    try {
        // Authenticate
        const authResult = await authenticateRequest(request);
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        // Use service layer
        const classLevels = await ClassLevelsService.getAll();

        // Transform to snake_case for API response
        const data = classLevels.map((cl) => ({
            id: cl.id,
            name_en: cl.nameEn,
            name_mr: cl.nameMr,
            slug: cl.slug,
            description_en: cl.descriptionEn,
            description_mr: cl.descriptionMr,
            order_index: cl.orderIndex,
        }));

        return successResponse(data);
    } catch (error) {
        console.error('[API] Class levels error:', error);
        return ApiErrors.serverError('Failed to fetch class levels');
    }
}

/**
 * POST /api/v1/class-levels
 * 
 * Create a new class level.
 */
export async function POST(request: NextRequest) {
    try {
        const authResult = await authenticateRequest(request, {
            requireStudent: false,
            allowedRoles: ['admin', 'super_admin']
        });
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const body = await request.json();

        // Simple validation
        if (!body.name_en) {
            return ApiErrors.validationError('English name is required');
        }

        const classLevel = await ClassLevelsService.create({
            nameEn: body.name_en,
            nameMr: body.name_mr,
            descriptionEn: body.description_en,
            descriptionMr: body.description_mr,
            orderIndex: body.order_index,
            slug: body.slug,
        });

        return successResponse(classLevel, 201);
    } catch (error) {
        console.error('[API] Create class level error:', error);
        return ApiErrors.serverError('Failed to create class level');
    }
}
