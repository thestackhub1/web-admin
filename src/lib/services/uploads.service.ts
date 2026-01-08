// Server-side only — can use database and server secrets

import { createClient } from '@/lib/supabase/server';

export interface UploadResult {
    url: string;
    path: string;
    size: number;
    mimeType: string;
}

/**
 * Uploads Service
 * 
 * Handles file uploads to Supabase Storage.
 * This service is called by API routes to handle file storage operations.
 */
export const uploadsService = {
    /**
     * Upload an image to question-assets bucket
     */
    async uploadQuestionImage(
        file: Buffer,
        fileName: string,
        mimeType: string
    ): Promise<UploadResult> {
        const supabase = await createClient();

        // Generate unique filename
        const fileExt = fileName.split('.').pop() || 'png';
        const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `question-images/${uniqueFileName}`;

        // Upload to Supabase Storage
        const { error } = await supabase.storage
            .from('question-assets')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: mimeType,
            });

        if (error) {
            console.error('[Uploads Service] Upload error:', error);
            throw new Error(`Failed to upload file: ${error.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('question-assets')
            .getPublicUrl(filePath);

        return {
            url: publicUrl,
            path: filePath,
            size: file.length,
            mimeType,
        };
    },

    /**
     * Delete an image from question-assets bucket
     */
    async deleteQuestionImage(filePath: string): Promise<void> {
        const supabase = await createClient();

        const { error } = await supabase.storage
            .from('question-assets')
            .remove([filePath]);

        if (error) {
            console.error('[Uploads Service] Delete error:', error);
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    },

    /**
     * Upload user avatar to avatars bucket
     */
    async uploadAvatar(
        file: Buffer,
        fileName: string,
        mimeType: string,
        userId: string
    ): Promise<UploadResult> {
        const supabase = await createClient();

        // Generate filename linked to user
        const fileExt = fileName.split('.').pop() || 'png';
        const filePath = `${userId}/${Date.now()}.${fileExt}`;

        // Upload to Supabase Storage
        const { error } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true, // Overwrite previous avatar
                contentType: mimeType,
            });

        if (error) {
            console.error('[Uploads Service] Avatar upload error:', error);
            throw new Error(`Failed to upload avatar: ${error.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return {
            url: publicUrl,
            path: filePath,
            size: file.length,
            mimeType,
        };
    },
};
