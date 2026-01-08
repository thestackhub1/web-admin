
import { successResponse, errorResponse } from "@/lib/api/response";
import { analyticsService } from "@/lib/services/analytics.service";

export const revalidate = 60;

export async function GET() {
    try {
        const metrics = await analyticsService.getKpiMetrics();
        return successResponse(metrics);
    } catch (error: any) {
        console.error("KPI Metrics API Error:", error);
        return errorResponse("Failed to fetch kpi metrics", 500);
    }
}
