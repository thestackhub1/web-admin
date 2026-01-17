/**
 * Timestamp Utilities
 *
 * Provides timestamp handling for SQLite/Turso since it stores
 * timestamps as TEXT (ISO 8601 strings) or INTEGER (Unix epoch).
 *
 * @module db/utils/timestamps
 */

/**
 * Get current timestamp as ISO 8601 string
 *
 * @returns Current timestamp in ISO 8601 format
 * @example
 * const now = nowISO();
 * // "2026-01-17T10:30:00.000Z"
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Get current date as YYYY-MM-DD string
 *
 * @returns Current date string
 * @example
 * const today = todayDate();
 * // "2026-01-17"
 */
export function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Get current time as HH:MM:SS string
 *
 * @returns Current time string
 * @example
 * const time = currentTime();
 * // "10:30:00"
 */
export function currentTime(): string {
  return new Date().toISOString().split("T")[1].split(".")[0];
}

/**
 * Parse ISO timestamp string to Date object
 *
 * @param value - ISO timestamp string or null
 * @returns Date object or null
 */
export function parseTimestamp(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Parse date string to Date object
 *
 * @param value - Date string (YYYY-MM-DD) or null
 * @returns Date object or null
 */
export function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  // Add time component for proper parsing
  const date = new Date(`${value}T00:00:00.000Z`);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Format Date object to ISO timestamp string
 *
 * @param date - Date object or null
 * @returns ISO timestamp string or null
 */
export function formatTimestamp(date: Date | null | undefined): string | null {
  if (!date) return null;
  return date.toISOString();
}

/**
 * Format Date object to date string (YYYY-MM-DD)
 *
 * @param date - Date object or null
 * @returns Date string or null
 */
export function formatDate(date: Date | null | undefined): string | null {
  if (!date) return null;
  return date.toISOString().split("T")[0];
}

/**
 * Format Date object to time string (HH:MM:SS)
 *
 * @param date - Date object or null
 * @returns Time string or null
 */
export function formatTime(date: Date | null | undefined): string | null {
  if (!date) return null;
  return date.toISOString().split("T")[1].split(".")[0];
}

/**
 * Get timestamp fields for insert operations
 *
 * @returns Object with createdAt and updatedAt fields
 */
export function getInsertTimestamps(): { createdAt: string; updatedAt: string } {
  const now = nowISO();
  return {
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Get timestamp field for update operations
 *
 * @returns Object with updatedAt field
 */
export function getUpdateTimestamp(): { updatedAt: string } {
  return {
    updatedAt: nowISO(),
  };
}

/**
 * Convert a date value (Date object or string) to ISO string
 * Handles both PostgreSQL Date objects and SQLite string timestamps
 *
 * @param value - Date object, ISO string, or null/undefined
 * @returns ISO string or null
 */
export function toISOStringOrNull(
  value: Date | string | null | undefined
): string | null {
  if (!value) return null;
  if (typeof value === "string") {
    // Already a string, validate and return
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return null;
}
