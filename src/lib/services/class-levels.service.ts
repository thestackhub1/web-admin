/**
 * Class Levels Service
 * 
 * Business logic for class level management.
 * Uses DbService for all database operations.
 */

import { dbService, type RLSContext } from './dbService';
import { eq, and, asc } from 'drizzle-orm';
import { classLevels, subjectClassMappings, type ClassLevel } from '@/db/schema';

export class ClassLevelsService {
  /**
   * Get all active class levels
   */
  static async getAll() {
    const db = await dbService.getDb();

    return db
      .select({
        id: classLevels.id,
        nameEn: classLevels.nameEn,
        nameMr: classLevels.nameMr,
        slug: classLevels.slug,
        descriptionEn: classLevels.descriptionEn,
        descriptionMr: classLevels.descriptionMr,
        orderIndex: classLevels.orderIndex,
      })
      .from(classLevels)
      .where(eq(classLevels.isActive, true))
      .orderBy(asc(classLevels.orderIndex));
  }

  /**
   * Get class level by slug
   */
  static async getBySlug(slug: string) {
    const db = await dbService.getDb();

    const [classLevel] = await db
      .select()
      .from(classLevels)
      .where(and(eq(classLevels.slug, slug), eq(classLevels.isActive, true)))
      .limit(1);

    return classLevel || null;
  }

  /**
   * Get class level by ID
   */
  static async getById(classLevelId: string, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [classLevel] = await db
      .select()
      .from(classLevels)
      .where(and(eq(classLevels.id, classLevelId), eq(classLevels.isActive, true)))
      .limit(1);

    return classLevel || null;
  }

  /**
   * Add a subject to a class level
   */
  static async addSubject(classLevelId: string, subjectId: string, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    // Check if mapping already exists
    const existing = await db
      .select()
      .from(subjectClassMappings)
      .where(
        and(
          eq(subjectClassMappings.classLevelId, classLevelId),
          eq(subjectClassMappings.subjectId, subjectId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // If exists but inactive, reactivate it
      if (!existing[0].isActive) {
        await db
          .update(subjectClassMappings)
          .set({ isActive: true })
          .where(eq(subjectClassMappings.id, existing[0].id));
        return { success: true };
      }
      return { success: true }; // Already active
    }

    // Create new mapping
    await db.insert(subjectClassMappings).values({
      classLevelId,
      subjectId,
      isActive: true,
    });

    return { success: true };
  }

  /**
   * Remove a subject from a class level
   */
  static async removeSubject(classLevelId: string, subjectId: string, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    // Soft delete by setting isActive to false
    await db
      .update(subjectClassMappings)
      .set({ isActive: false })
      .where(
        and(
          eq(subjectClassMappings.classLevelId, classLevelId),
          eq(subjectClassMappings.subjectId, subjectId)
        )
      );

    return { success: true };
  }
  /**
   * Create a new class level
   */
  static async create(data: {
    nameEn: string;
    nameMr?: string;
    descriptionEn?: string;
    descriptionMr?: string;
    orderIndex?: number;
    slug?: string;
  }, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    // Generate slug if not provided
    const slug = data.slug || this.generateSlug(data.nameEn);

    // Default order index: last + 1
    let orderIndex = data.orderIndex;
    if (orderIndex === undefined) {
      const last = await db
        .select({ orderIndex: classLevels.orderIndex })
        .from(classLevels)
        .orderBy(asc(classLevels.orderIndex)) // Actually we want desc to find last, but let's query max
        .limit(1);

      // TODO: Better way to get max, but this works for small lists
      const all = await db.select({ orderIndex: classLevels.orderIndex }).from(classLevels);
      const maxOrder = all.reduce((max, curr) => Math.max(max, curr.orderIndex || 0), 0);
      orderIndex = maxOrder + 1;
    }

    const [newClassLevel] = await db
      .insert(classLevels)
      .values({
        nameEn: data.nameEn,
        nameMr: data.nameMr || data.nameEn, // Default to English name if Marathi not provided
        slug,
        descriptionEn: data.descriptionEn, // Nullable in schema
        descriptionMr: data.descriptionMr, // Nullable in schema
        orderIndex,
        isActive: true,
      })
      .returning();

    return newClassLevel;
  }

  /**
   * Update a class level
   */
  static async update(id: string, data: {
    nameEn?: string;
    nameMr?: string;
    descriptionEn?: string;
    descriptionMr?: string;
    orderIndex?: number;
    slug?: string;
    isActive?: boolean;
  }, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const updates: any = {
      updatedAt: new Date(),
    };

    if (data.nameEn !== undefined) updates.nameEn = data.nameEn;
    if (data.nameMr !== undefined) updates.nameMr = data.nameMr;
    if (data.descriptionEn !== undefined) updates.descriptionEn = data.descriptionEn;
    if (data.descriptionMr !== undefined) updates.descriptionMr = data.descriptionMr;
    if (data.orderIndex !== undefined) updates.orderIndex = data.orderIndex;
    if (data.isActive !== undefined) updates.isActive = data.isActive;

    // Regenerate slug if needed and not provided explicitly
    if (data.slug) {
      updates.slug = data.slug;
    } else if (data.nameEn && !data.slug) {
      // Option: could auto-update slug, but usually safer to keep stable unless requested
      // updates.slug = this.generateSlug(data.nameEn); 
    }

    const [updated] = await db
      .update(classLevels)
      .set(updates)
      .where(eq(classLevels.id, id))
      .returning();

    return updated || null;
  }

  /**
   * Delete a class level (Soft Delete)
   */
  static async delete(id: string, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [deleted] = await db
      .update(classLevels)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(classLevels.id, id))
      .returning();

    return deleted || null;
  }

  /**
   * Generate a URL-friendly slug
   */
  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

