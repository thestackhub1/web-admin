/**
 * Security Service
 *
 * Application-level security to replace PostgreSQL Row-Level Security (RLS).
 * Provides authorization checks and query filtering based on user permissions.
 *
 * This is necessary because SQLite/Turso doesn't support RLS.
 * All security checks must be performed in the application layer.
 *
 * @module lib/auth/security
 */

import type { Profile } from "@/db/schema.turso";

/**
 * User roles in the system
 */
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Check if a role has admin privileges
 */
export function isAdminRole(role: string | null | undefined): boolean {
  return role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN;
}

/**
 * Check if a role has teacher or higher privileges
 */
export function isTeacherOrAbove(role: string | null | undefined): boolean {
  return (
    role === ROLES.SUPER_ADMIN ||
    role === ROLES.ADMIN ||
    role === ROLES.TEACHER
  );
}

/**
 * Security Service
 *
 * Provides authorization checks for all data access operations.
 * Use this service before returning data to users.
 */
export class SecurityService {
  /**
   * Check if user can access any resource (admin check)
   */
  static isAdmin(user: Profile): boolean {
    return isAdminRole(user.role);
  }

  /**
   * Check if user can access a specific resource by owner ID
   *
   * @param user - The authenticated user
   * @param resourceOwnerId - The owner ID of the resource
   * @returns True if access is allowed
   */
  static canAccess(user: Profile, resourceOwnerId: string | null): boolean {
    // Admin can access everything
    if (isAdminRole(user.role)) {
      return true;
    }

    // Users can only access their own resources
    return user.id === resourceOwnerId;
  }

  /**
   * Check if user can access school-specific data
   *
   * @param user - The authenticated user
   * @param schoolId - The school ID to check
   * @returns True if access is allowed
   */
  static canAccessSchool(user: Profile, schoolId: string | null): boolean {
    // Admin can access all schools
    if (isAdminRole(user.role)) {
      return true;
    }

    // Users can only access their own school
    return user.schoolId === schoolId;
  }

  /**
   * Check if user can modify a resource
   *
   * @param user - The authenticated user
   * @param resourceOwnerId - The owner ID of the resource
   * @returns True if modification is allowed
   */
  static canModify(user: Profile, resourceOwnerId: string | null): boolean {
    // Admin can modify anything
    if (isAdminRole(user.role)) {
      return true;
    }

    // Teachers can modify their own resources
    if (user.role === ROLES.TEACHER) {
      return user.id === resourceOwnerId;
    }

    // Students cannot modify resources (except their own profile)
    return false;
  }

  /**
   * Check if user can delete a resource
   *
   * @param user - The authenticated user
   * @param resourceOwnerId - The owner ID of the resource
   * @returns True if deletion is allowed
   */
  static canDelete(user: Profile, resourceOwnerId: string | null): boolean {
    // Only admin can delete
    if (isAdminRole(user.role)) {
      return true;
    }

    // Teachers can delete their own resources
    if (user.role === ROLES.TEACHER) {
      return user.id === resourceOwnerId;
    }

    return false;
  }

  /**
   * Check if user can create content (questions, exams, etc.)
   *
   * @param user - The authenticated user
   * @returns True if content creation is allowed
   */
  static canCreateContent(user: Profile): boolean {
    return isTeacherOrAbove(user.role);
  }

  /**
   * Check if user can manage users
   *
   * @param user - The authenticated user
   * @returns True if user management is allowed
   */
  static canManageUsers(user: Profile): boolean {
    return isAdminRole(user.role);
  }

  /**
   * Check if user can view analytics
   *
   * @param user - The authenticated user
   * @returns True if analytics viewing is allowed
   */
  static canViewAnalytics(user: Profile): boolean {
    return isTeacherOrAbove(user.role);
  }

  /**
   * Filter array of items based on user access
   *
   * @param items - Array of items to filter
   * @param user - The authenticated user
   * @param getOwnerId - Function to extract owner ID from item
   * @returns Filtered array
   */
  static filterByAccess<T>(
    items: T[],
    user: Profile,
    getOwnerId: (item: T) => string | null
  ): T[] {
    // Admin sees everything
    if (isAdminRole(user.role)) {
      return items;
    }

    // Filter to only items user can access
    return items.filter((item) => {
      const ownerId = getOwnerId(item);
      return this.canAccess(user, ownerId);
    });
  }

  /**
   * Filter items by school access
   *
   * @param items - Array of items to filter
   * @param user - The authenticated user
   * @param getSchoolId - Function to extract school ID from item
   * @returns Filtered array
   */
  static filterBySchool<T>(
    items: T[],
    user: Profile,
    getSchoolId: (item: T) => string | null
  ): T[] {
    // Admin sees everything
    if (isAdminRole(user.role)) {
      return items;
    }

    // Filter to only items from user's school
    return items.filter((item) => {
      const schoolId = getSchoolId(item);
      return this.canAccessSchool(user, schoolId);
    });
  }

  /**
   * Assert user has access or throw error
   *
   * @param user - The authenticated user
   * @param resourceOwnerId - The owner ID of the resource
   * @throws Error if access is denied
   */
  static assertAccess(user: Profile, resourceOwnerId: string | null): void {
    if (!this.canAccess(user, resourceOwnerId)) {
      throw new Error("Access denied: You do not have permission to access this resource.");
    }
  }

  /**
   * Assert user can modify or throw error
   *
   * @param user - The authenticated user
   * @param resourceOwnerId - The owner ID of the resource
   * @throws Error if modification is denied
   */
  static assertCanModify(user: Profile, resourceOwnerId: string | null): void {
    if (!this.canModify(user, resourceOwnerId)) {
      throw new Error("Access denied: You do not have permission to modify this resource.");
    }
  }

  /**
   * Assert user is admin or throw error
   *
   * @param user - The authenticated user
   * @throws Error if user is not admin
   */
  static assertAdmin(user: Profile): void {
    if (!this.isAdmin(user)) {
      throw new Error("Access denied: Admin privileges required.");
    }
  }
}

// Export singleton-style functions for convenience
export const canAccess = SecurityService.canAccess.bind(SecurityService);
export const canModify = SecurityService.canModify.bind(SecurityService);
export const canDelete = SecurityService.canDelete.bind(SecurityService);
export const filterByAccess = SecurityService.filterByAccess.bind(SecurityService);
export const filterBySchool = SecurityService.filterBySchool.bind(SecurityService);
