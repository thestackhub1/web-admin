/**
 * Class Level Scheduled Exams API Route
 * 
 * GET /api/v1/class-levels/[slug]/scheduled-exams - Get all scheduled exams for a class level
 */

import { NextRequest } from "next/server";
import { successResponse, ApiErrors } from "@/lib/api/response";
import { authenticateRequest, isAuthContext } from "@/lib/auth";
import { ClassLevelsService } from "@/lib/services/class-levels.service";
import { ScheduledExamsService } from "@/lib/services/scheduled-exams.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log(`[API] Fetching scheduled exams for class level: ${slug}`);

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

    // Get query params
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subject_id") || undefined;
    const status = searchParams.get("status") || "all";

    // Get scheduled exams for this class level
    const exams = await ScheduledExamsService.getAll({
      classLevelId: classLevel.id,
      subjectId,
      status,
    });

    // The service already returns data in snake_case format with proper structure
    // Just need to ensure subject property name is correct
    const formattedExams = exams.map((exam: Record<string, unknown>) => ({
      ...exam,
      // Normalize subject/subjects for consistency
      subject: exam.subjects || null,
    }));

    return successResponse(formattedExams);
  } catch (error) {
    console.error("[API] Error fetching class level scheduled exams:", error);
    return ApiErrors.serverError(
      error instanceof Error ? error.message : "Internal Server Error"
    );
  }
}
