/**
 * POST /api/v1/auth/logout
 * 
 * Logout the current user.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/route-handler';

export async function POST(request: NextRequest) {
    try {
        const { supabase, applySetCookies } = createRouteHandlerClient(request);

        // Sign out using Supabase - this will clear the session
        await supabase.auth.signOut();

        // Create response
        const response = NextResponse.json({
            success: true,
            data: { message: 'Logged out successfully' }
        });

        // Apply any cookies set by Supabase (including session clearing)
        return applySetCookies(response);
    } catch (error) {
        console.error('[API] Logout error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to logout' },
            { status: 500 }
        );
    }
}

