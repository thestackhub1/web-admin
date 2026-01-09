/**
 * Class Levels Service
 * 
 * Business logic for class level management.
 * Uses DbService for all database operations.
 */

import { dbService, type RLSContext } from './dbService';
import { eq, and, asc } from 'drizzle-orm';
import { classLevels, subjectClassMappings, subjects, scheduledExams, profiles, examStructures, exams, type ClassLevel } from '@/db/schema';
import { count, or, sql } from 'drizzle-orm';

export class ClassLevelsService {
  /**
   * Get all active class levels
   */
  static async getAll() {
    const db = await dbService.getDb();

    // Fetch class levels with their subject mappings
    const results = await db
      .select({
        id: classLevels.id,
        nameEn: classLevels.nameEn,
        nameMr: classLevels.nameMr,
        slug: classLevels.slug,
        descriptionEn: classLevels.descriptionEn,
        descriptionMr: classLevels.descriptionMr,
        orderIndex: classLevels.orderIndex,
        subjectMapping: {
          id: subjectClassMappings.id,
          subjectId: subjectClassMappings.subjectId,
          isActive: subjectClassMappings.isActive,
        },
        subject: {
          id: subjects.id,
          nameEn: subjects.nameEn,
          nameMr: subjects.nameMr,
          slug: subjects.slug,
        }
      })
      .from(classLevels)
      .leftJoin(subjectClassMappings, and(
        eq(subjectClassMappings.classLevelId, classLevels.id),
        eq(subjectClassMappings.isActive, true)
      ))
      .leftJoin(subjects, eq(subjectClassMappings.subjectId, subjects.id))
      .where(eq(classLevels.isActive, true))
      .orderBy(asc(classLevels.orderIndex));

    // Fetch exam counts separately to avoid Cartesian product/fan-out issues
    const examCounts = await db
      .select({
        classLevelId: scheduledExams.classLevelId,
        count: count(scheduledExams.id),
      })
      .from(scheduledExams)
      .where(eq(scheduledExams.isActive, true))
      .groupBy(scheduledExams.classLevelId);

    const examCountMap = new Map(examCounts.map(e => [e.classLevelId, e.count]));

    // Aggregate results
    const classLevelMap = new Map<string, any>();

    for (const row of results) {
      if (!classLevelMap.has(row.id)) {
        classLevelMap.set(row.id, {
          id: row.id,
          nameEn: row.nameEn,
          nameMr: row.nameMr,
          slug: row.slug,
          descriptionEn: row.descriptionEn,
          descriptionMr: row.descriptionMr,
          orderIndex: row.orderIndex,
          subjects: [],
          examCount: examCountMap.get(row.id) || 0,
        });
      }

      if (row.subject && row.subjectMapping?.isActive) {
        classLevelMap.get(row.id).subjects.push(row.subject);
      }
    }

    return Array.from(classLevelMap.values());
  }

  /**
   * Get class level stats (students, blueprints, exams, attempts)
   */
  static async getStats(classLevelId: string, slug?: string, nameEn?: string) {
    const db = await dbService.getDb();

    // 1. Student Count
    // We try to match by ID, Slug, or Name (legacy)
    const conditions = [];
    if (slug) conditions.push(eq(profiles.classLevel, slug));
    if (nameEn) conditions.push(eq(profiles.classLevel, nameEn));
    // Also try to match by ID if profiles stores ID (future proofing)
    conditions.push(eq(profiles.classLevel, classLevelId));

    const studentCountQuery = db
      .select({ count: profiles.id })
      .from(profiles)
      .where(
        and(
          eq(profiles.role, 'student'),
          eq(profiles.isActive, true),
          or(...conditions)
        )
      );

    // 2. Exam Structures (Blueprints)
    const structuresCountQuery = db
      .select({ count: examStructures.id })
      .from(examStructures)
      .where(
        and(
          eq(examStructures.classLevelId, classLevelId),
          eq(examStructures.isActive, true)
        )
      );

    // 3. Scheduled Exams
    const scheduledExamsCountQuery = db
      .select({ count: scheduledExams.id })
      .from(scheduledExams)
      .where(
        and(
          eq(scheduledExams.classLevelId, classLevelId),
          // We count all non-cancelled exams for stats
          // Optionally filtering by status in the future
        )
      );

    // 4. Exam Attempts (via Scheduled Exams)
    // We need to join exams -> scheduledExams -> filter by classLevelId
    const attemptsCountQuery = db
      .select({ count: exams.id })
      .from(exams)
      .innerJoin(scheduledExams, eq(exams.scheduledExamId, scheduledExams.id))
      .where(eq(scheduledExams.classLevelId, classLevelId));

    const [students, structures, scheduled, attempts] = await Promise.all([
      studentCountQuery,
      structuresCountQuery,
      scheduledExamsCountQuery,
      attemptsCountQuery
    ]);

    return {
      studentCount: students.length,
      examStructureCount: structures.length,
      scheduledExamCount: scheduled.length,
      examAttemptCount: attempts.length
    };
  }

  /**
   * Get class level by slug with stats
   */
  static async getBySlug(slug: string) {
    const db = await dbService.getDb();

    // Use LOWER() for case-insensitive matching
    const [classLevel] = await db
      .select()
      .from(classLevels)
      .where(
        and(
          sql`LOWER(${classLevels.slug}) = ${slug.toLowerCase()}`,
          eq(classLevels.isActive, true)
        )
      )
      .limit(1);

    if (!classLevel) {
      return null;
    }

    // Fetch stats
    const stats = await this.getStats(classLevel.id, classLevel.slug, classLevel.nameEn);

    return {
      ...classLevel,
      ...stats
    };
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

