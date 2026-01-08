/**
 * Zod Validation Schemas
 * 
 * Input validation schemas for all API endpoints.
 */

import { z } from 'zod';

// ============================================
// Common Validators
// ============================================

/**
 * Indian phone number regex (10 digits starting with 6-9)
 */
const indianPhoneRegex = /^[6-9]\d{9}$/;

/**
 * Slug regex (lowercase letters, numbers, underscores, hyphens)
 */
const slugRegex = /^[a-z0-9_-]+$/;

/**
 * Sanitize search string to prevent injection
 * Removes special characters that could be used in SQL/regex attacks
 */
export function sanitizeSearchQuery(query: string): string {
    return query
        .replace(/[%_\\]/g, '') // Remove SQL wildcards and escape chars
        .replace(/[<>"'`;(){}[\]]/g, '') // Remove potential injection chars
        .trim()
        .slice(0, 100); // Limit length
}

// ============================================
// Auth Schemas
// ============================================

export const loginSchema = z.object({
    email: z.string().email('Invalid email address').optional(),
    phone: z.string()
        .regex(indianPhoneRegex, 'Invalid phone number (must be 10 digits starting with 6-9)')
        .optional(),
    password: z.string().min(1, 'Password is required'),
}).refine(data => data.email || data.phone, {
    message: 'Either email or phone is required',
});

export const signupSchema = z.object({
    email: z.string().email('Invalid email address').optional(),
    phone: z.string()
        .regex(indianPhoneRegex, 'Invalid phone number (must be 10 digits starting with 6-9)')
        .optional(),
    password: z.string()
        .min(6, 'Password must be at least 6 characters')
        .max(72, 'Password too long'), // bcrypt limit
    name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
    school_id: z.string().uuid('Invalid school ID').optional(),
    new_school: z.object({
        name: z.string().min(1).max(200),
        location_city: z.string().max(100).optional(),
        location_state: z.string().max(100).optional(),
        location_country: z.string().max(100).optional().default('India'),
    }).optional(),
    class_level: z.string().min(1, 'Class level is required').max(20, 'Invalid class level').optional(),
    preferred_language: z.enum(['en', 'mr']).optional().default('en'),
}).refine(data => data.email || data.phone, {
    message: 'Either email or phone is required',
    path: ['email'],
}).refine(data => data.school_id || data.new_school, {
    message: 'School information is required (school_id or new_school)',
    path: ['school_id'],
});




// ============================================
// Profile Schemas
// ============================================

export const updateProfileSchema = z.object({
    name: z.string().min(1).optional(),
    preferred_language: z.enum(['en', 'mr']).optional(),
});

// ============================================
// Questions Schemas
// ============================================

/**
 * Allowed question types (whitelist for security)
 */
const allowedQuestionTypes = [
    'fill_blank', 'true_false', 'mcq_single', 'mcq_two', 'mcq_three',
    'match', 'short_answer', 'programming', 'mcq', 'tf', 'fib'
] as const;

export const questionsQuerySchema = z.object({
    chapter_id: z.string().uuid('Invalid chapter ID').optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    type: z.enum(allowedQuestionTypes).optional(),
    search: z.string().max(100, 'Search query too long').optional()
        .transform(val => val ? sanitizeSearchQuery(val) : undefined),
    limit: z.coerce.number().min(1).max(100).optional().default(20),
    offset: z.coerce.number().min(0).max(10000).optional().default(0),
});

// ============================================
// Exam Schemas
// ============================================

export const startExamSchema = z.object({
    structure_id: z.string().uuid('Invalid exam structure ID').optional(),
    subject_slug: z.string()
        .min(1, 'Invalid subject slug')
        .max(50, 'Subject slug too long')
        .regex(slugRegex, 'Invalid subject slug format')
        .optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional().default('medium'),
}).refine(data => data.structure_id || data.subject_slug, {
    message: 'Either structure_id or subject_slug is required',
});

export const myExamsQuerySchema = z.object({
    status: z.enum(['in_progress', 'completed', 'abandoned']).optional(),
    limit: z.coerce.number().min(1).max(100).optional().default(20),
    offset: z.coerce.number().min(0).optional().default(0),
});

export const saveAnswersSchema = z.object({
    answers: z.array(
        z.object({
            question_id: z.string().uuid('Invalid question ID'),
            user_answer: z.unknown(),
        })
    ).min(1, 'At least one answer is required'),
});

// ============================================
// Common Param Schemas
// ============================================

/**
 * Slug validation schema
 */
export const slugParamSchema = z.string()
    .min(1, 'Slug is required')
    .max(50, 'Slug too long')
    .regex(slugRegex, 'Invalid slug format');

/**
 * UUID validation schema
 */
export const uuidParamSchema = z.string().uuid('Invalid ID format');

// ============================================
// Type Exports
// ============================================

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type QuestionsQueryInput = z.infer<typeof questionsQuerySchema>;
export type StartExamInput = z.infer<typeof startExamSchema>;
export type MyExamsQueryInput = z.infer<typeof myExamsQuerySchema>;
export type SaveAnswersInput = z.infer<typeof saveAnswersSchema>;
