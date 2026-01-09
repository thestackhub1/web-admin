/**
 * Client Services
 *
 * These are server-side data fetching services that use authServerApi.
 * They are used in Server Components to fetch data from API routes.
 *
 * Note: src/lib/services are for direct database operations.
 *       src/client/services are for API-based data fetching.
 */

export * from "./subjects.service";
export * from "./users.service";
export * from "./exams.service";
export * from "./questions.service";
export * from "./schools.service";
export * from "./scheduled-exams.service";
export * from "./exam-structures.service";
export * from "./profile.service";
export * from "./chapters.service";
export * from "./class-levels.service";
