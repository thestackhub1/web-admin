
import { successResponse, errorResponse } from "@/lib/api/response";
import { analyticsService } from "@/lib/services/analytics.service";

export const revalidate = 60;

export async function GET() {
    try {
        const data = await analyticsService.getSubjectAnalytics();
        return successResponse(data);
    } catch (error: any) {
        console.error("Subject Analytics API Error:", error);
        return errorResponse("Failed to fetch subject analytics", 500);
    }
}
