/**
 * POST /api/v1/auth/refresh
 *
 * Refresh access token using a refresh token.
 */

import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth/auth.service";
import { z } from "zod";

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = refreshSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { refreshToken } = parsed.data;

    // Refresh tokens
    const result = await authService.refreshTokens(refreshToken);

    if (!result.success || !result.tokens) {
      return NextResponse.json(
        { success: false, error: result.error || "Token refresh failed" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      expiresAt: result.tokens.expiresAt,
    });
  } catch (error) {
    console.error("[API] Token refresh error:", error);
    return NextResponse.json(
      { success: false, error: "Token refresh failed" },
      { status: 500 }
    );
  }
}
