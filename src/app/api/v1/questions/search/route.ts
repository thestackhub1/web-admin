/**
 * Questions Search API Route
 *
 * GET /api/v1/questions/search - Search questions across all subjects
 */

import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, isAuthContext } from "@/lib/auth";
import { successResponse, ApiErrors } from "@/lib/api/response";
import { dbService } from "@/lib/services/dbService";
import {
    questionsScholarship,
    questionsEnglish,
    questionsInformationTechnology,
} from "@/db/schema";
import { ilike, and, eq } from "drizzle-orm";

// Question tables with their subject info
const QUESTION_TABLES = [
    { table: questionsScholarship, subjectSlug: "scholarship", subjectName: "Scholarship" },
    { table: questionsEnglish, subjectSlug: "english", subjectName: "English" },
    { table: questionsInformationTechnology, subjectSlug: "information-technology", subjectName: "Information Technology" },
] as const;

export async function GET(request: NextRequest) {
    try {
        // Authenticate and check admin role
        const authResult = await authenticateRequest(request, {
            allowedRoles: ["admin"],
        });

        if (!isAuthContext(authResult)) {
            return authResult;
        }

        // Parse query params
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q") || "";
        const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 20);

        if (!query || query.length < 2) {
            return NextResponse.json(successResponse([]));
        }

        // Get database connection
        const db = await dbService.getDb();
        const searchPattern = `%${query}%`;
        const perTableLimit = Math.ceil(limit / QUESTION_TABLES.length);

        // Search across all question tables in parallel
        const searchPromises = QUESTION_TABLES.map(async ({ table, subjectSlug, subjectName }) => {
            const results = await db
                .select({
                    id: table.id,
                    question_text: table.questionText,
                    question_type: table.questionType,
                    chapter_id: table.chapterId,
                })
                .from(table)
                .where(
                    and(
                        eq(table.isActive, true),
                        ilike(table.questionText, searchPattern)
                    )
                )
                .limit(perTableLimit);

            // Add subject info to each result
            return results.map(r => ({
                ...r,
                subject_slug: subjectSlug,
                subject_name: subjectName,
            }));
        });

        const allResults = await Promise.all(searchPromises);
        const flatResults = allResults.flat().slice(0, limit);

        return NextResponse.json(successResponse(flatResults));
    } catch (error) {
        console.error("[API] Questions search error:", error);
        return ApiErrors.serverError("Failed to search questions");
    }
}
