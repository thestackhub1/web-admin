/**
 * Users API Route
 *
 * GET /api/v1/users - List all users with pagination and filtering
 */

import { NextRequest } from "next/server";
import { authenticateRequest, isAuthContext } from "@/lib/auth";
import { successResponse, ApiErrors } from "@/lib/api/response";
import { UsersService } from "@/lib/services";

export async function GET(request: NextRequest) {
    try {
        // Authenticate and check admin role
        const authResult = await authenticateRequest(request, {
            allowedRoles: ['admin']
        });

        if (!isAuthContext(authResult)) {
            return authResult;
        }

        // Parse query params
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const pageSize = parseInt(searchParams.get("pageSize") || "20");
        const role = searchParams.get("role") || undefined;
        const search = searchParams.get("search") || undefined;
        const schoolId = searchParams.get("schoolId") || undefined;
        const isActiveParam = searchParams.get("isActive");
        const isActive = isActiveParam !== null ? isActiveParam === "true" : undefined;

        // Use service to fetch users
        const result = await UsersService.getAll(
            {
                page,
                pageSize,
                role,
                search,
                isActive,
                schoolId,
            },
            {
                userId: authResult.user.id,
                role: authResult.profile.role,
                email: authResult.user.email,
            }
        );

        return successResponse({
            items: result.items,
            pagination: {
                page: result.page,
                pageSize: result.pageSize,
                totalItems: result.totalItems,
                totalPages: result.totalPages,
                hasNextPage: result.page < result.totalPages,
                hasPreviousPage: result.page > 1,
            },
        });
    } catch (error) {
        console.error("[API] Users error:", error);
        return ApiErrors.serverError("Failed to fetch users");
    }
}

export async function POST(request: NextRequest) {
    try {
        // Authenticate and check admin role
        const authResult = await authenticateRequest(request, {
            allowedRoles: ['admin']
        });

        if (!isAuthContext(authResult)) {
            return authResult;
        }

        // Parse body
        const body = await request.json();

        // Validation (Basic)
        if (!body.email || !body.name || !body.role) {
            return ApiErrors.badRequest("Missing required fields: email, name, role");
        }

        // Create user via service
        const newUser = await UsersService.create({
            email: body.email,
            password: body.password || undefined,
            name: body.name,
            role: body.role,
            schoolId: body.schoolId || undefined,
            classLevel: body.classLevel || undefined,
            isActive: body.isActive ?? true,
        });

        return successResponse(newUser, 201);
    } catch (error: any) {
        console.error("[API] Create User error:", error);
        return ApiErrors.serverError(error.message || "Failed to create user");
    }
}
