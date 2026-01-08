// Server-side API route for file uploads

import { NextRequest, NextResponse } from 'next/server';
import { uploadsService } from '@/lib/services/uploads.service';
import { authenticateRequest, isAuthContext } from '@/lib/auth';

/**
 * POST /api/v1/uploads
 * 
 * Upload a file (image) to storage.
 * Accepts multipart/form-data with a 'file' field.
 */
export async function POST(request: NextRequest) {
    try {
        // Authenticate user - allow admin and teacher roles
        const authResult = await authenticateRequest(request, {
            requireStudent: false,
            allowedRoles: ['admin', 'teacher', 'super_admin'],
        });
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        // Parse form data
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const type = formData.get('type') as string || 'question-image';

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { success: false, error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' },
                { status: 400 }
            );
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, error: 'File too large. Maximum size is 5MB' },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload based on type
        let result;
        switch (type) {
            case 'question-image':
                result = await uploadsService.uploadQuestionImage(
                    buffer,
                    file.name,
                    file.type
                );
                break;
            case 'avatar':
                result = await uploadsService.uploadAvatar(
                    buffer,
                    file.name,
                    file.type,
                    authResult.user.id
                );
                break;
            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid upload type' },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('[Uploads API] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to upload file'
            },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/v1/uploads
 * 
 * Delete a file from storage.
 */
export async function DELETE(request: NextRequest) {
    try {
        // Authenticate user - allow admin and teacher roles
        const authResult = await authenticateRequest(request, {
            requireStudent: false,
            allowedRoles: ['admin', 'teacher', 'super_admin'],
        });
        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const { path, type } = await request.json();

        if (!path) {
            return NextResponse.json(
                { success: false, error: 'No file path provided' },
                { status: 400 }
            );
        }

        // Delete based on type
        switch (type) {
            case 'question-image':
                await uploadsService.deleteQuestionImage(path);
                break;
            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid upload type' },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            success: true,
            data: { deleted: true },
        });
    } catch (error) {
        console.error('[Uploads API] Delete Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete file'
            },
            { status: 500 }
        );
    }
}
