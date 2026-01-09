/**
 * Class Level Subject Removal API Route
 * 
 * DELETE /api/v1/class-levels/[slug]/subjects/[subjectId] - Remove a subject from a class level
 */

import { NextRequest } from "next/server";
import { successResponse, ApiErrors } from "@/lib/api/response";
import { authenticateRequest, isAuthContext } from "@/lib/auth";
import { ClassLevelsService } from "@/lib/services/class-levels.service";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; subjectId: string }> }
) {
  try {
    const { slug, subjectId } = await params;
    console.log(`[API] Removing subject ${subjectId} from class level: ${slug}`);

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

    // Remove subject from class level
    const result = await ClassLevelsService.removeSubject(
      classLevel.id,
      subjectId
    );

    return successResponse(result);
  } catch (error) {
    console.error("[API] Error removing subject from class level:", error);
    return ApiErrors.serverError(
      error instanceof Error ? error.message : "Internal Server Error"
    );
  }
}
