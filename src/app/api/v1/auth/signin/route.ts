/**
 * POST /api/v1/auth/signin
 * 
 * Sign in a user with email/phone and password.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/route-handler';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/api/rate-limit';
import { z } from 'zod';

// Accept either email or phone
const signinSchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
}).refine((data) => data.email || data.phone, {
  message: 'Email or phone is required',
});

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const clientIp = getClientIp(request);
        const rateLimitKey = `signin:${clientIp}`;
        const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.signin);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { success: false, error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        const body = await request.json();

        // Validate input
        const parsed = signinSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const { email, phone, password } = parsed.data;
        
        // Determine the identifier (email or phone)
        const identifier = email || phone || '';

        const { supabase, applySetCookies } = createRouteHandlerClient(request);

        // Convert phone number to email format if it's a phone number (10 digits)
        const authEmail = /^[6-9]\d{9}$/.test(identifier)
            ? `${identifier}@phone.local`
            : identifier;

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: authEmail,
            password,
        });

        if (authError) {
            return NextResponse.json(
                { success: false, error: authError.message },
                { status: 400 }
            );
        }

        if (!authData.user) {
            return NextResponse.json(
                { success: false, error: 'Sign in failed' },
                { status: 500 }
            );
        }

        // Fetch user profile to determine role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authData.user.id)
            .single();

        // Create response with cookies
        const response = NextResponse.json({
            success: true,
            data: {
                user_id: authData.user.id,
                role: profile?.role || 'student',
                redirect: '/dashboard',
            }
        });

        // Apply auth cookies to the response
        return applySetCookies(response);
    } catch (error) {
        console.error('[API] Signin error:', error);
        return NextResponse.json(
            { success: false, error: 'Sign in failed' },
            { status: 500 }
        );
    }
}

