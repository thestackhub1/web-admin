/**
 * Authentication & Authorization Types
 *
 * Types for user authentication, roles, and permissions.
 */

/**
 * User roles in the admin portal
 * Only admin-level roles are allowed (no students)
 */
export const USER_ROLES = ["admin", "teacher", "school_admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

/**
 * User profile from the database
 */
export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    school_id?: string | null;
    avatar_url?: string | null;
    phone?: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * User with extended profile information
 */
export interface UserWithProfile extends User {
    school?: {
        id: string;
        name: string;
    } | null;
}

/**
 * Session user (minimal data for auth context)
 */
export interface SessionUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
}

/**
 * Authentication state
 */
export interface AuthState {
    user: SessionUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
    email: string;
    password: string;
}

/**
 * Role-based permission check
 */
export function hasRole(user: SessionUser | null, roles: UserRole[]): boolean {
    if (!user) return false;
    return roles.includes(user.role);
}

/**
 * Check if user is an admin
 */
export function isAdmin(user: SessionUser | null): boolean {
    return hasRole(user, ["admin"]);
}

/**
 * Check if user can manage users (admin or school_admin)
 */
export function canManageUsers(user: SessionUser | null): boolean {
    return hasRole(user, ["admin", "school_admin"]);
}

/**
 * Check if user can manage content (admin or teacher)
 */
export function canManageContent(user: SessionUser | null): boolean {
    return hasRole(user, ["admin", "teacher"]);
}
