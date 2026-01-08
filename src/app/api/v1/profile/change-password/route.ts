/**
 * POST /api/v1/profile/change-password
 * 
 * Change the authenticated user's password.
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { authenticateRequest, isAuthContext } from '@/lib/auth';
import { ProfileService } from '@/lib/services';
import { z } from 'zod';

const changePasswordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
    try {
        const authResult = await authenticateRequest(request, { requireStudent: false });
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const body = await request.json();

        // Validate input
        const parsed = changePasswordSchema.safeParse(body);
        if (!parsed.success) {
            return ApiErrors.validationError(parsed.error.issues[0].message);
        }

        const { password } = parsed.data;

        // Change password using service (which uses admin client)
        await ProfileService.changePassword(authResult.user.id, password);

        return successResponse({ success: true, message: 'Password changed successfully' });
    } catch (error: any) {
        console.error('[API] Change password error:', error);
        return ApiErrors.serverError('Failed to change password');
    }
}
