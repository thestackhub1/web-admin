/**
 * Role Constants
 *
 * Centralized role definitions for RBAC.
 */

/**
 * Allowed roles in the admin portal
 */
export const ALLOWED_ROLES = ["admin", "teacher", "school_admin"] as const;

/**
 * Role display labels
 */
export const ROLE_LABELS: Record<(typeof ALLOWED_ROLES)[number], string> = {
    admin: "Administrator",
    teacher: "Teacher",
    school_admin: "School Administrator",
};

/**
 * Role permissions mapping
 */
export const ROLE_PERMISSIONS = {
    admin: {
        canManageUsers: true,
        canManageContent: true,
        canManageSchools: true,
        canViewAnalytics: true,
        canManageSettings: true,
    },
    teacher: {
        canManageUsers: false,
        canManageContent: true,
        canManageSchools: false,
        canViewAnalytics: true,
        canManageSettings: false,
    },
    school_admin: {
        canManageUsers: true,
        canManageContent: true,
        canManageSchools: false,
        canViewAnalytics: true,
        canManageSettings: false,
    },
} as const;
