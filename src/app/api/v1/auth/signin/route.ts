/**
 * POST /api/v1/auth/signin
 *
 * Sign in a user with email/phone and password.
 * Uses custom JWT authentication with Turso database.
 */

import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth/auth.service";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/api/rate-limit";
import { ADMIN_ROLES } from "@/lib/auth/middleware";
import { z } from "zod";

// Accept either email or phone
const signinSchema = z
  .object({
    email: z.string().optional(),
    phone: z.string().optional(),
    password: z.string().min(1, "Password is required"),
  })
  .refine((data) => data.email || data.phone, {
    message: "Email or phone is required",
  });

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitKey = `signin:${clientIp}`;
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.signin);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
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
    const identifier = email || phone || "";

    // Authenticate user
    const result = await authService.signIn({
      emailOrPhone: identifier,
      password,
    });

    if (!result.success || !result.user || !result.tokens) {
      return NextResponse.json(
        { success: false, error: result.error || "Sign in failed" },
        { status: 400 }
      );
    }

    const role = result.user.role;
    const isAllowed = ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]);

    if (!isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Access denied. This portal is for administrators and teachers only. Students should use the Student Portal.",
        },
        { status: 403 }
      );
    }

    // Return tokens in response body
    // Client should store these in localStorage
    return NextResponse.json({
      success: true,
      data: {
        user_id: result.user.id,
        role: role,
        redirect: "/dashboard",
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        expiresAt: result.tokens.expiresAt,
      },
    });
  } catch (error) {
    console.error("[API] Signin error:", error);
    return NextResponse.json(
      { success: false, error: "Sign in failed" },
      { status: 500 }
    );
  }
}