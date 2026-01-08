
import { successResponse, errorResponse } from "@/lib/api/response";
import { analyticsService } from "@/lib/services/analytics.service";

// Cache for 60 seconds
export const revalidate = 60;

export async function GET() {
    try {
        const stats = await analyticsService.getDashboardStats();
        return successResponse(stats);
    } catch (error: any) {
        console.error("Dashboard Stats API Error:", error);
        return errorResponse("Failed to fetch dashboard stats", 500);
    }
}
