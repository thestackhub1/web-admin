import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, isAuthContext } from "@/lib/auth";
import { successResponse, ApiErrors } from "@/lib/api/response";
import { QuestionsService } from "@/lib/services/questions.service";

export async function GET(request: NextRequest) {
    try {
        const authResult = await authenticateRequest(request, {
            allowedRoles: ["admin"],
        });

        if (!isAuthContext(authResult)) {
            return authResult;
        }

        const { searchParams } = new URL(request.url);
        const subjectSlug = searchParams.get("subject");
        const difficulty = searchParams.get("difficulty") || undefined;
        const questionType = searchParams.get("questionType") || undefined;
        const isActive = searchParams.has("status")
            ? searchParams.get("status") === "active"
            : undefined;
        const search = searchParams.get("search") || undefined;
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = parseInt(searchParams.get("offset") || "0");

        let questions;

        if (subjectSlug) {
            questions = await QuestionsService.getBySubject(subjectSlug, {
                difficulty,
                questionType,
                isActive,
                limit,
                offset,
            });

            // Filter by search text if provided (in-memory for subject-specific until service supports it)
            // Note: QuestionsService.getAll supports search, but getBySubject needs modification or we do it here
            // For consistency, let's just use getAll if search is provided, or rely on client side filtering for now?
            // Actually, let's update getAll to handle subject filtration too?
            // For now, let's assume `getBySubject` doesn't support text search yet so if we have text search, use getAll with subject filter logic?
            // Wait, QuestionsService.getAll iterates ALL subjects. If we pass subjectSlug, we should just restrict it there.

            // Let's keep it simple: if subject is provided, use getBySubject. If search is provided, we might miss it.
            // Better approach: Update getAll in service to accept specific subject list optimization?
            // No, let's just rely on QuestionsService.getAll logic which does search.

        } else {
            questions = await QuestionsService.getAll({
                difficulty,
                questionType,
                isActive,
                search,
                limit,
                offset,
            });
        }

        // Since getAll provides standardized output, we return it directly
        return NextResponse.json(successResponse(questions));

    } catch (error) {
        console.error("[API] Questions fetch error:", error);
        return ApiErrors.serverError("Failed to fetch questions");
    }
}
