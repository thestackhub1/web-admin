/**
 * ID Generation Utilities
 *
 * Provides UUID generation for SQLite/Turso since it doesn't support
 * auto-generated UUIDs like PostgreSQL's uuid_generate_v4().
 *
 * @module db/utils/id
 */

import { randomUUID } from "crypto";

/**
 * Generate a new UUID v4
 *
 * @returns A new UUID string (36 characters)
 * @example
 * const id = generateId();
 * // "550e8400-e29b-41d4-a716-446655440000"
 */
export function generateId(): string {
  return randomUUID();
}

/**
 * Validate if a string is a valid UUID v4
 *
 * @param id - The string to validate
 * @returns True if valid UUID v4, false otherwise
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Generate multiple UUIDs at once
 *
 * @param count - Number of UUIDs to generate
 * @returns Array of UUID strings
 */
export function generateIds(count: number): string[] {
  return Array.from({ length: count }, () => generateId());
}
