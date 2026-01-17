// Server-side only — can use file system and server secrets

import { mkdir, writeFile, unlink, access, constants } from 'fs/promises';
import { join } from 'path';

export interface UploadResult {
    url: string;
    path: string;
    size: number;
    mimeType: string;
}

// Base upload directory - relative to project root
const UPLOAD_BASE_DIR = process.env.UPLOAD_DIR || 'public/uploads';

/**
 * Ensure upload directory exists
 */
async function ensureDir(dirPath: string): Promise<void> {
    try {
        await access(dirPath, constants.F_OK);
    } catch {
        await mkdir(dirPath, { recursive: true });
    }
}

/**
 * Get the absolute path for uploads
 */
function getAbsoluteUploadPath(subPath: string): string {
    const baseDir = process.cwd();
    return join(baseDir, UPLOAD_BASE_DIR, subPath);
}

/**
 * Get the public URL for an uploaded file
 */
function getPublicUrl(path: string): string {
    const basePath = process.env.NEXT_PUBLIC_UPLOAD_URL || '/uploads';
    return `${basePath}/${path}`;
}

/**
 * Uploads Service
 * 
 * Handles file uploads to local file system.
 * In production, this can be configured to use cloud storage (S3, Azure Blob, etc.)
 */
export const uploadsService = {
    /**
     * Upload an image to question-images directory
     */
    async uploadQuestionImage(
        file: Buffer,
        fileName: string,
        mimeType: string
    ): Promise<UploadResult> {
        const fileExt = fileName.split('.').pop() || 'png';
        const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const relativePath = `question-images/${uniqueFileName}`;
        const absolutePath = getAbsoluteUploadPath(relativePath);

        await ensureDir(getAbsoluteUploadPath('question-images'));

        try {
            await writeFile(absolutePath, file);
        } catch (error) {
            console.error('[Uploads Service] Write error:', error);
            throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        return {
            url: getPublicUrl(relativePath),
            path: relativePath,
            size: file.length,
            mimeType,
        };
    },

    /**
     * Delete an image from storage
     */
    async deleteQuestionImage(filePath: string): Promise<void> {
        const absolutePath = getAbsoluteUploadPath(filePath);

        try {
            await unlink(absolutePath);
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                console.error('[Uploads Service] Delete error:', error);
                throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    },

    /**
     * Upload user avatar to avatars directory
     */
    async uploadAvatar(
        file: Buffer,
        fileName: string,
        mimeType: string,
        userId: string
    ): Promise<UploadResult> {
        const fileExt = fileName.split('.').pop() || 'png';
        const relativePath = `avatars/${userId}/${Date.now()}.${fileExt}`;
        const absolutePath = getAbsoluteUploadPath(relativePath);

        await ensureDir(getAbsoluteUploadPath(`avatars/${userId}`));

        try {
            await writeFile(absolutePath, file);
        } catch (error) {
            console.error('[Uploads Service] Avatar upload error:', error);
            throw new Error(`Failed to upload avatar: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        return {
            url: getPublicUrl(relativePath),
            path: relativePath,
            size: file.length,
            mimeType,
        };
    },

    /**
     * Delete user avatar from storage
     */
    async deleteAvatar(filePath: string): Promise<void> {
        await this.deleteQuestionImage(filePath);
    },
};
