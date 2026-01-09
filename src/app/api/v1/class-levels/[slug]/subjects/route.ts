/**
 * Class Level Subjects API Route
 * 
 * GET /api/v1/class-levels/[slug]/subjects - Get all subjects for a class level
 * POST /api/v1/class-levels/[slug]/subjects - Add a subject to a class level
 */

import { NextRequest } from "next/server";
import { successResponse, ApiErrors } from "@/lib/api/response";
import { authenticateRequest, isAuthContext } from "@/lib/auth";
import { dbService } from "@/lib/services/dbService";
import { ClassLevelsService } from "@/lib/services/class-levels.service";
import { subjectClassMappings, subjects } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log(`[API] Fetching subjects for class level: ${slug}`);

    // Authenticate request
    const authResult = await authenticateRequest(request);
    if (!isAuthContext(authResult)) {
      return authResult;
    }

    // Get class level by slug
    const classLevel = await ClassLevelsService.getBySlug(slug);
    if (!classLevel) {
      return ApiErrors.notFound("Class level not found");
    }

    // Get subjects for this class level
    const db = await dbService.getDb();
    const mappings = await db
      .select({
        id: subjects.id,
        name_en: subjects.nameEn,
        name_mr: subjects.nameMr,
        slug: subjects.slug,
        description_en: subjects.descriptionEn,
        icon: subjects.icon,
        is_category: subjects.isCategory,
        parent_subject_id: subjects.parentSubjectId,
        order_index: subjects.orderIndex,
      })
      .from(subjectClassMappings)
      .innerJoin(subjects, eq(subjectClassMappings.subjectId, subjects.id))
      .where(
        and(
          eq(subjectClassMappings.classLevelId, classLevel.id),
          eq(subjectClassMappings.isActive, true),
          eq(subjects.isActive, true)
        )
      );

    return successResponse(mappings);
  } catch (error) {
    console.error("[API] Error fetching class level subjects:", error);
    return ApiErrors.serverError(
      error instanceof Error ? error.message : "Internal Server Error"
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log(`[API] Adding subject to class level: ${slug}`);

    // Authenticate request
    const authResult = await authenticateRequest(request, {
      allowedRoles: ['admin', 'teacher']
    });
    if (!isAuthContext(authResult)) {
      return authResult;
    }

    // Get class level by slug
    const classLevel = await ClassLevelsService.getBySlug(slug);
    if (!classLevel) {
      return ApiErrors.notFound("Class level not found");
    }

    // Parse request body
    const body = await request.json();
    const { subject_id } = body;

    if (!subject_id) {
      return ApiErrors.badRequest("subject_id is required");
    }

    // Add subject to class level
    const result = await ClassLevelsService.addSubject(
      classLevel.id,
      subject_id
    );

    return successResponse(result);
  } catch (error) {
    console.error("[API] Error adding subject to class level:", error);
    return ApiErrors.serverError(
      error instanceof Error ? error.message : "Internal Server Error"
    );
  }
}
