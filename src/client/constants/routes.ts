/**
 * Route Constants
 *
 * Centralized route paths for navigation and redirects.
 */

/**
 * Public routes (no auth required)
 */
export const PUBLIC_ROUTES = ["/login", "/signup", "/auth/callback"] as const;

/**
 * Admin route paths
 */
export const ROUTES = {
    // Auth
    LOGIN: "/login",
    SIGNUP: "/signup",
    AUTH_CALLBACK: "/auth/callback",

    // Dashboard
    DASHBOARD: "/dashboard",

    // Questions
    QUESTIONS: "/dashboard/questions",
    QUESTIONS_SUBJECT: (subject: string) => `/dashboard/questions/${subject}`,
    QUESTIONS_NEW: (subject: string) => `/dashboard/questions/${subject}/new`,
    QUESTIONS_EDIT: (subject: string, id: string) =>
        `/dashboard/questions/${subject}/${id}/edit`,
    QUESTIONS_IMPORT: (subject: string) =>
        `/dashboard/questions/${subject}/import`,

    // Exams
    EXAM_STRUCTURES: "/dashboard/exam-structures",
    EXAM_STRUCTURES_NEW: "/dashboard/exam-structures/new",
    EXAM_STRUCTURES_EDIT: (id: string) => `/dashboard/exam-structures/${id}/edit`,

    // Scheduled Exams
    SCHEDULED_EXAMS: "/dashboard/scheduled-exams",
    SCHEDULED_EXAMS_NEW: "/dashboard/scheduled-exams/new",
    SCHEDULED_EXAMS_EDIT: (id: string) => `/dashboard/scheduled-exams/${id}/edit`,

    // Users
    USERS: "/dashboard/users",
    USERS_NEW: "/dashboard/users/new",
    USERS_EDIT: (id: string) => `/dashboard/users/${id}/edit`,

    // Schools
    SCHOOLS: "/dashboard/schools",

    // Class Levels
    CLASS_LEVELS: "/dashboard/class-levels",

    // Subjects
    SUBJECTS: "/dashboard/subjects",

    // Analytics
    ANALYTICS: "/dashboard/analytics",

    // Settings
    SETTINGS: "/dashboard/settings",
} as const;

/**
 * API routes
 */
export const API_ROUTES = {
    // Auth
    AUTH_SIGNIN: "/api/v1/auth/signin",
    AUTH_SIGNOUT: "/api/v1/auth/signout",

    // Questions
    QUESTIONS: (subject: string) => `/api/v1/questions/${subject}`,
    QUESTION: (subject: string, id: string) =>
        `/api/v1/questions/${subject}/${id}`,

    // Exam Structures
    EXAM_STRUCTURES: "/api/v1/exam-structures",
    EXAM_STRUCTURE: (id: string) => `/api/v1/exam-structures/${id}`,

    // Scheduled Exams
    SCHEDULED_EXAMS: "/api/v1/scheduled-exams",
    SCHEDULED_EXAM: (id: string) => `/api/v1/scheduled-exams/${id}`,

    // Class Levels
    CLASS_LEVELS: "/api/v1/class-levels",
    CLASS_LEVEL: (id: string) => `/api/v1/class-levels/${id}`,

    // Schools
    SCHOOLS: "/api/v1/schools",
    SCHOOL: (id: string) => `/api/v1/schools/${id}`,

    // Users
    USERS: "/api/v1/users",
    USER: (id: string) => `/api/v1/users/${id}`,

    // Profile
    PROFILE: "/api/v1/profile",

    // Analytics
    ANALYTICS: "/api/v1/analytics",
} as const;
