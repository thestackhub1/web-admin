/**
 * Supabase Admin Client
 * 
 * Creates a Supabase client with service_role key for server-side operations.
 * This bypasses RLS and should only be used in secure server contexts.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let adminClient: SupabaseClient | null = null;

/**
 * Get the Supabase admin client (singleton)
 * Uses service_role key to bypass RLS
 */
export function getSupabaseAdmin(): SupabaseClient {
    if (adminClient) return adminClient;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error(
            'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
        );
    }

    adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    return adminClient;
}

/**
 * Verify a JWT token and return the user
 * @param token - The JWT access token
 * @returns The user object or null if invalid
 */
export async function verifyToken(token: string) {
    const supabase = getSupabaseAdmin();

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        return null;
    }

    return user;
}
