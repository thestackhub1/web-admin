/**
 * POST /api/v1/auth/logout
 *
 * Logout the current user.
 * With JWT-based auth, logout is handled client-side by clearing tokens.
 * This endpoint is provided for consistency and potential server-side cleanup.
 */

import { NextResponse } from "next/server";

export async function POST() {
  try {
    // With JWT-based auth, logout is primarily client-side
    // The client should clear tokens from localStorage
    // This endpoint can be used for:
    // 1. Server-side session invalidation (if implemented)
    // 2. Audit logging
    // 3. API consistency

    return NextResponse.json({
      success: true,
      data: { message: "Logged out successfully" },
    });
  } catch (error) {
    console.error("[API] Logout error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to logout" },
      { status: 500 }
    );
  }
}
