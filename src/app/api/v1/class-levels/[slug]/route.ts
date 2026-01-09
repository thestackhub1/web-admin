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

        return successResponse(classLevel);
    } catch (error) {
        return ApiErrors.serverError(error instanceof Error ? error.message : "Internal Server Error");
    }
}
