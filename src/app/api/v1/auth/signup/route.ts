/**
 * POST /api/v1/auth/signup
 *
 * Register a new school admin/teacher account.
 * Uses custom JWT authentication with Turso database.
 */

import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { successResponse, ApiErrors } from "@/lib/api/response";
import { signupSchema } from "@/lib/api/validators";
import { authService } from "@/lib/auth/auth.service";
import { DbService as TursoDbService } from "@/lib/services/dbService.turso";
import { schools } from "@/db/schema.turso";
import { generateId } from "@/db/utils/id";
import { nowISO } from "@/db/utils/timestamps";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/api/rate-limit";

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

    const {
      email,
      phone,
      password,
      name,
      school_id,
      new_school,
      class_level,
      preferred_language,
    } = parsed.data;

    // Handle school selection/creation first
    let finalSchoolId: string | null = null;
    const dbService = TursoDbService.getInstance();
    const db = await dbService.getDb();

    if (school_id) {
      // Use provided school_id
      finalSchoolId = school_id;
    } else if (new_school) {
      // Create new school
      const normalizedName = new_school.name.toLowerCase().trim().replace(/\s+/g, " ");

      // Check for duplicates first
      const [existingSchool] = await db
        .select()
        .from(schools)
        .where(eq(schools.nameSearch, normalizedName))
        .limit(1);

      if (existingSchool) {
        finalSchoolId = existingSchool.id;
      } else {
        // Create new school
        const now = nowISO();
        const [newSchool] = await db
          .insert(schools)
          .values({
            id: generateId(),
            name: new_school.name.trim(),
            nameSearch: normalizedName,
            locationCity: new_school.location_city?.trim() || null,
            locationState: new_school.location_state?.trim() || null,
            locationCountry: new_school.location_country || "India",
            isVerified: false,
            isUserAdded: true,
            createdAt: now,
            updatedAt: now,
          })
          .returning();

        if (newSchool) {
          finalSchoolId = newSchool.id;
        }
      }
    }

    // Create user via auth service
    const result = await authService.signUp({
      email: email || undefined,
      phone: phone || undefined,
      password,
      name: name || (email ? email.split("@")[0] : phone || "User"),
      role: "school_admin",
      schoolId: finalSchoolId || undefined,
      classLevel: class_level || undefined,
    });

    if (!result.success || !result.user) {
      return ApiErrors.badRequest(result.error || "Signup failed");
    }

    return successResponse(
      {
        user_id: result.user.id,
        message: "Account created successfully",
        accessToken: result.tokens?.accessToken,
        refreshToken: result.tokens?.refreshToken,
      },
      201
    );
  } catch (error) {
    console.error("[API] Signup error:", error);
    return ApiErrors.serverError("Signup failed");
  }
}
