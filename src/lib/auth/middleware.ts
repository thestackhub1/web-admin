/**
 * API Authentication Middleware
 *
 * Verifies JWT tokens and enforces role-based access control for API routes.
 * Uses custom JWT implementation with Turso database.
 */

import { NextRequest } from "next/server";
import { verifyAccessToken, extractBearerToken } from "./jwt";
import { authService } from "./auth.service";
import { ApiErrors } from "../api/response";

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  preferred_language: string;
  is_active: boolean;
}

export interface AuthContext {
  user: AuthUser;
  profile: AuthProfile;
}

/**
 * Roles allowed to access the admin portal
 */
export const ADMIN_ROLES = [
  "admin",
  "super_admin",
  "teacher",
  "school_admin",
] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];
export type AllowedRole = AdminRole | "student";

/**
 * Authenticate request and return user context
 * Returns error response if authentication fails
 *
 * Options:
 * - requireStudent: If true, only 'student' role allowed (default: false for admin portal)
 * - allowedRoles: Array of allowed roles (overrides requireStudent if provided)
 */
export async function authenticateRequest(
  request: NextRequest,
  options: {
    requireStudent?: boolean;
    allowedRoles?: AllowedRole[];
  } = {}
): Promise<AuthContext | ReturnType<typeof ApiErrors.unauthorized>> {
  // Default allowed roles for Admin Portal if none provided
  const effectiveAllowedRoles =
    options.allowedRoles ||
    (options.requireStudent ? ["student"] : [...ADMIN_ROLES]);

  // Extract token from Authorization header
  const authHeader = request.headers.get("authorization");
  const token = extractBearerToken(authHeader);

  if (!token) {
    return ApiErrors.unauthorized("Missing authorization token");
  }

  // Verify JWT token
  const payload = await verifyAccessToken(token);
  if (!payload) {
    return ApiErrors.unauthorized("Invalid or expired token");
  }

  // Get user from auth service
  const user = await authService.getUserFromToken(payload);
  if (!user) {
    return ApiErrors.unauthorized("User not found");
  }

  // Build profile object
  const profile: AuthProfile = {
    id: user.id,
    email: user.email || "",
    name: user.name,
    role: user.role,
    preferred_language: "en",
    is_active: true,
  };

  // Role-based access control
  if (!effectiveAllowedRoles.includes(profile.role as AllowedRole)) {
    return ApiErrors.forbidden(
      `Access denied. Role '${profile.role}' is not authorized for this action.`
    );
  }

  return {
    user: { id: user.id, email: user.email || "" },
    profile,
  };
}

/**
 * Type guard to check if result is an auth context
 */
export function isAuthContext(
  result: AuthContext | ReturnType<typeof ApiErrors.unauthorized>
): result is AuthContext {
  return "user" in result && "profile" in result;
}

