
import { successResponse, errorResponse } from "@/lib/api/response";
import { analyticsService } from "@/lib/services/analytics.service";

export const revalidate = 60;

export async function GET() {
    try {
        const activity = await analyticsService.getRecentActivity();
        return successResponse(activity);
    } catch (error: any) {
        console.error("Recent Activity API Error:", error);
        return errorResponse("Failed to fetch recent activity", 500);
    }
}
