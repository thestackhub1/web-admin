import { NextRequest } from "next/server";
import { ClassLevelsService } from "@/lib/services/class-levels.service";
import { successResponse, ApiErrors } from "@/lib/api/response";
import { getSessionToken } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        console.log(`[API] Fetching class level: ${slug}`);

        // Check authentication
        const token = await getSessionToken();
        if (!token) {
            return ApiErrors.unauthorized();
        }

        const classLevel = await ClassLevelsService.getBySlug(slug);

        if (!classLevel) {
            return ApiErrors.notFound("Class level not found");
        }

        // Transform to snake_case for API response consistency
        const data = {
            id: classLevel.id,
            name_en: classLevel.nameEn,
            name_mr: classLevel.nameMr,
            slug: classLevel.slug,
            description_en: classLevel.descriptionEn,
            description_mr: classLevel.descriptionMr,
            order_index: classLevel.orderIndex,
            is_active: classLevel.isActive,
            studentCount: classLevel.studentCount,
            examStructureCount: classLevel.examStructureCount,
            scheduledExamCount: classLevel.scheduledExamCount,
            examAttemptCount: classLevel.examAttemptCount,
        };

        return successResponse(data);
    } catch (error) {
        return ApiErrors.serverError(error instanceof Error ? error.message : "Internal Server Error");
    }
}
