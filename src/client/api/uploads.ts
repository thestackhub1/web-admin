// Client-side only — no server secrets or database access here

/**
 * Uploads API Client
 * 
 * Client-side functions for uploading files through the API layer.
 */

import { getAccessToken } from '@/lib/auth/client';

export interface UploadResult {
    url: string;
    path: string;
    size: number;
    mimeType: string;
}

export interface UploadResponse {
    data: UploadResult | null;
    error: string | null;
}

/**
 * Upload a question image
 * 
 * @param file - The file to upload
 * @returns Upload result with URL
 */
export async function uploadQuestionImage(file: File): Promise<UploadResponse> {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'question-image');

        const token = await getAccessToken();

        const response = await fetch('/api/v1/uploads', {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
            credentials: 'include',
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            return {
                data: null,
                error: result.error || 'Upload failed',
            };
        }

        return {
            data: result.data,
            error: null,
        };
    } catch (error) {
        console.error('[Upload Client] Error:', error);
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Upload failed',
        };
    }
}

/**
 * Delete a question image
 * 
 * @param path - The file path to delete
 * @returns Success or error
 */
export async function deleteQuestionImage(path: string): Promise<{ success: boolean; error: string | null }> {
    try {
        const token = await getAccessToken();

        const response = await fetch('/api/v1/uploads', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ path, type: 'question-image' }),
            credentials: 'include',
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            return {
                success: false,
                error: result.error || 'Delete failed',
            };
        }

        return {
            success: true,
            error: null,
        };
    } catch (error) {
        console.error('[Upload Client] Delete Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Delete failed',
        };
    }
}
