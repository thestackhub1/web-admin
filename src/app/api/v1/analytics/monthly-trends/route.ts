
import { successResponse, errorResponse } from "@/lib/api/response";
import { analyticsService } from "@/lib/services/analytics.service";

export const revalidate = 60;

export async function GET() {
    try {
        const data = await analyticsService.getMonthlyTrends();
        return successResponse(data);
    } catch (error: any) {
        console.error("Monthly Trends API Error:", error);
        return errorResponse("Failed to fetch monthly trends", 500);
    }
}
