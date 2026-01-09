import { NextRequest } from "next/server";
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

        return successResponse(questions);

    } catch (error) {
        console.error("[API] Questions fetch error:", error);
        return ApiErrors.serverError("Failed to fetch questions");
    }
}
