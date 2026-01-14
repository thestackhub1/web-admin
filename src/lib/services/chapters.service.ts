/**
 * Chapters Service
 * 
 * Business logic for chapter management.
 * Uses DbService for all database operations.
 */

import { dbService, type RLSContext } from './dbService';
import { eq, and, asc, inArray, or } from 'drizzle-orm';
import { chapters, subjects } from '@/db/schema';

export class ChaptersService {
  /**
   * Get all active chapters for a subject
   */
  static async getBySubjectId(subjectId: string) {
    const db = await dbService.getDb();

    return db
      .select({
        id: chapters.id,
        nameEn: chapters.nameEn,
        nameMr: chapters.nameMr,
        descriptionEn: chapters.descriptionEn,
        descriptionMr: chapters.descriptionMr,
        orderIndex: chapters.orderIndex,
      })
      .from(chapters)
      .where(
        and(eq(chapters.subjectId, subjectId), eq(chapters.isActive, true))
      )
      .orderBy(asc(chapters.orderIndex));
  }

  /**
   * Get chapters for a subject by slug
   * Handles both hyphen and underscore variants for slug matching
   */
  static async getBySubjectSlug(subjectSlug: string) {
    const db = await dbService.getDb();

    // Normalize slug variants (try both hyphen and underscore)
    const hyphenSlug = subjectSlug.replace(/_/g, "-");
    const underscoreSlug = subjectSlug.replace(/-/g, "_");

    // First get subject - try both variants
    const [subject] = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(and(
        or(
          eq(subjects.slug, hyphenSlug),
          eq(subjects.slug, underscoreSlug)
        ),
        eq(subjects.isActive, true)
      ))
      .limit(1);

    if (!subject) {
      return [];
    }

    return this.getBySubjectId(subject.id);
  }

  /**
   * Get chapter by ID
   */
  static async getById(chapterId: string, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [chapter] = await db
      .select()
      .from(chapters)
      .where(and(eq(chapters.id, chapterId), eq(chapters.isActive, true)))
      .limit(1);

    return chapter || null;
  }

  /**
   * Get chapters by IDs
   */
  static async getByIds(chapterIds: string[], rlsContext?: RLSContext) {
    if (chapterIds.length === 0) {
      return [];
    }

    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    return db
      .select({
        id: chapters.id,
        nameEn: chapters.nameEn,
        nameMr: chapters.nameMr,
      })
      .from(chapters)
      .where(and(
        inArray(chapters.id, chapterIds),
        eq(chapters.isActive, true)
      ));
  }

  /**
   * Create a new chapter
   */
  static async create(data: {
    subjectId: string;
    nameEn: string;
    nameMr: string;
    descriptionEn?: string;
    descriptionMr?: string;
    orderIndex?: number;
  }, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [chapter] = await db
      .insert(chapters)
      .values({
        subjectId: data.subjectId,
        nameEn: data.nameEn,
        nameMr: data.nameMr,
        descriptionEn: data.descriptionEn,
        descriptionMr: data.descriptionMr,
        orderIndex: data.orderIndex ?? 0,
        isActive: true,
      })
      .returning();

    return chapter;
  }

  /**
   * Update a chapter
   */
  static async update(
    chapterId: string,
    data: {
      nameEn?: string;
      nameMr?: string;
      descriptionEn?: string;
      descriptionMr?: string;
      orderIndex?: number;
      isActive?: boolean;
    },
    rlsContext?: RLSContext
  ) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [chapter] = await db
      .update(chapters)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(chapters.id, chapterId))
      .returning();

    return chapter || null;
  }

  /**
   * Delete a chapter (soft delete)
   */
  static async delete(chapterId: string, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [chapter] = await db
      .update(chapters)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(chapters.id, chapterId))
      .returning();

    return chapter || null;
  }
}

