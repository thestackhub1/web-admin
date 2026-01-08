/**
 * POST /api/v1/auth/signup
 * 
 * Register a new school admin/teacher account.
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { signupSchema } from '@/lib/api/validators';
import { getSupabaseAdmin } from '@/lib/api/supabase-admin';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/api/rate-limit';

export async function POST(request: NextRequest) {
    try {
        // Rate limiting (stricter for signup)
        const clientIp = getClientIp(request);
        const rateLimitKey = `signup:${clientIp}`;
        const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.signup);

        if (!rateLimit.allowed) {
            return ApiErrors.rateLimited(rateLimit.resetAt);
        }

        const body = await request.json();

        // Validate input
        const parsed = signupSchema.safeParse(body);
        if (!parsed.success) {
            return ApiErrors.validationError(parsed.error.issues[0].message);
        }

        const { email, phone, password, name, school_id, new_school, class_level, preferred_language } = parsed.data;

        const supabase = getSupabaseAdmin();

        // Create auth user (use email or phone for auth identifier)
        const authIdentifier = email || `${phone}@phone.local`; // Supabase requires email format

        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: authIdentifier,
            password,
            email_confirm: true, // Auto-confirm for mobile app
            user_metadata: {
                name,
                phone,
                class_level,
                preferred_language,
            },
        });

        if (authError) {
            if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
                return ApiErrors.badRequest('This email/phone is already registered. Please login instead.');
            }
            return ApiErrors.badRequest(authError.message);
        }

        if (!authData.user) {
            return ApiErrors.serverError('User creation failed');
        }

        // Handle school selection/creation
        let finalSchoolId: string | null = null;

        if (school_id) {
            // Use provided school_id
            finalSchoolId = school_id;
        } else if (new_school) {
            // Create new school
            const normalizedName = new_school.name.toLowerCase().trim().replace(/\s+/g, ' ');

            // Check for duplicates first
            const { data: existingSchool } = await supabase
                .from('schools')
                .select('id, name')
                .eq('name_search', normalizedName)
                .eq('location_city', new_school.location_city || '')
                .eq('location_state', new_school.location_state || '')
                .limit(1)
                .single();

            if (existingSchool) {
                finalSchoolId = existingSchool.id;
            } else {
                // Create new school
                const { data: newSchool, error: schoolError } = await supabase
                    .from('schools')
                    .insert({
                        name: new_school.name.trim(),
                        name_search: normalizedName,
                        location_city: new_school.location_city?.trim() || null,
                        location_state: new_school.location_state?.trim() || null,
                        location_country: new_school.location_country || 'India',
                        created_by: authData.user.id,
                        is_verified: false,
                    })
                    .select('id')
                    .single();

                if (schoolError) {
                    console.error('[API] School creation error:', schoolError);
                    // Continue without school_id if creation fails
                } else {
                    finalSchoolId = newSchool.id;
                }
            }
        }

        // The profile should be auto-created by the database trigger
        // But let's verify it exists and update if needed
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (profileError) {
            // If trigger didn't create it, create manually
            if (profileError.code === 'PGRST116') {
                const { error: insertError } = await supabase
                    .from('profiles')
                    .insert({
                        id: authData.user.id,
                        email: email || null,
                        phone: phone || null,
                        name: name || (email ? email.split('@')[0] : phone),
                        school_id: finalSchoolId,
                        class_level: class_level || null,
                        role: 'school_admin',
                        preferred_language: preferred_language || 'en',
                    });

                if (insertError) {
                    console.error('[API] Profile creation error:', insertError);
                }
            }
        } else {
            // Update profile with provided values
            const updateData: Record<string, string | null> = {};
            if (name) updateData.name = name;
            if (phone) updateData.phone = phone;
            if (class_level) updateData.class_level = class_level;
            if (preferred_language) updateData.preferred_language = preferred_language;
            if (finalSchoolId) updateData.school_id = finalSchoolId;

            if (Object.keys(updateData).length > 0) {
                await supabase
                    .from('profiles')
                    .update(updateData)
                    .eq('id', authData.user.id);
            }
        }

        return successResponse({
            user_id: authData.user.id,
            message: 'Account created successfully',
        }, 201);
    } catch (error) {
        console.error('[API] Signup error:', error);
        return ApiErrors.serverError('Signup failed');
    }
}
