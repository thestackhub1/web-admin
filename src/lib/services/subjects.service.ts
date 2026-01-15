/**
 * Subjects Service
 * 
 * Business logic for subject management.
 * Uses DbService for all database operations.
 */

import { dbService, type RLSContext } from './dbService';
import { eq, and, asc, desc, sql, isNull } from 'drizzle-orm';
import { subjects, subjectClassMappings, chapters, type Subject } from '@/db/schema';

export class SubjectsService {
  /**
   * Get all active subjects with hierarchical structure
   * Optionally filtered by class level
   */
  static async getAll(options?: { classLevelId?: string }) {
    const db = await dbService.getDb();

    // Fetch all active subjects
    const allSubjects = await db
      .select()
      .from(subjects)
      .where(eq(subjects.isActive, true))
      .orderBy(asc(subjects.orderIndex));

    let mappedSubjectIds = new Set<string>();

    // Filter by class level if provided
    if (options?.classLevelId) {
      const mappings = await db
        .select({ subjectId: subjectClassMappings.subjectId })
        .from(subjectClassMappings)
        .where(
          and(
            eq(subjectClassMappings.classLevelId, options.classLevelId),
            eq(subjectClassMappings.isActive, true)
          )
        );

      mappings.forEach((m) => mappedSubjectIds.add(m.subjectId));
    }

    // Build hierarchical tree
    const subjectMap = new Map<string, any>();
    const rootSubjects: any[] = [];

    // Initialize map
    allSubjects.forEach((s) => {
      subjectMap.set(s.id, { ...s, sub_subjects: [] });
    });

    // Assemble hierarchy
    allSubjects.forEach((s) => {
      const subject = subjectMap.get(s.id);
      if (s.parentSubjectId) {
        const parent = subjectMap.get(s.parentSubjectId);
        if (parent) {
          parent.sub_subjects.push(subject);
        } else {
          // Orphaned? Treat as root
          rootSubjects.push(subject);
        }
      } else {
        rootSubjects.push(subject);
      }
    });

    // Sort sub-subjects
    subjectMap.forEach((s) => {
      if (s.sub_subjects.length > 0) {
        s.sub_subjects.sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0));
      }
    });

    // Apply filter if needed
    let result = rootSubjects;
    if (options?.classLevelId) {
      result = rootSubjects.filter((root) => {
        const isRootMapped = mappedSubjectIds.has(root.id);
        const mappedChildren = root.sub_subjects.filter((child: any) =>
          mappedSubjectIds.has(child.id)
        );
        root.sub_subjects = mappedChildren;
        return isRootMapped || mappedChildren.length > 0;
      });
    }

    // Sort roots
    result.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

    return result;
  }

  /**
   * Get subject by slug
   * Includes sub-subjects if it's a category
   * Handles both hyphen and underscore formats (e.g., "information-technology" or "information_technology")
   */
  static async getBySlug(slug: string) {
    const db = await dbService.getDb();

    // Try exact match first
    let [subject] = await db
      .select()
      .from(subjects)
      .where(and(eq(subjects.slug, slug), eq(subjects.isActive, true)))
      .limit(1);

    // If not found, try alternate format (hyphen <-> underscore)
    if (!subject) {
      const alternateSlug = slug.includes('-') 
        ? slug.replace(/-/g, '_') 
        : slug.replace(/_/g, '-');
      
      [subject] = await db
        .select()
        .from(subjects)
        .where(and(eq(subjects.slug, alternateSlug), eq(subjects.isActive, true)))
        .limit(1);
    }

    if (!subject) {
      return null;
    }

    // If category, fetch sub-subjects
    let subSubjects: any[] = [];
    if (subject.isCategory) {
      subSubjects = await db
        .select()
        .from(subjects)
        .where(
          and(eq(subjects.parentSubjectId, subject.id), eq(subjects.isActive, true))
        )
        .orderBy(asc(subjects.orderIndex));
    }

    return {
      ...subject,
      sub_subjects: subSubjects,
    };
  }

  /**
   * Get subject by ID
   */
  static async getById(subjectId: string, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [subject] = await db
      .select()
      .from(subjects)
      .where(and(eq(subjects.id, subjectId), eq(subjects.isActive, true)))
      .limit(1);

    return subject || null;
  }

  /**
   * Get subjects for a class level
   */
  static async getByClassLevel(classLevelId: string) {
    const db = await dbService.getDb();

    const results = await db
      .select({
        subject: subjects,
      })
      .from(subjects)
      .innerJoin(subjectClassMappings, eq(subjects.id, subjectClassMappings.subjectId))
      .where(
        and(
          eq(subjectClassMappings.classLevelId, classLevelId),
          eq(subjects.isActive, true),
          eq(subjectClassMappings.isActive, true)
        )
      )
      .orderBy(asc(subjects.orderIndex));

    return results.map((r) => r.subject);
  }

  /**
   * Get child subjects for a category
   */
  static async getChildSubjects(parentSubjectId: string, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const children = await db
      .select()
      .from(subjects)
      .where(and(
        eq(subjects.parentSubjectId, parentSubjectId),
        eq(subjects.isActive, true)
      ))
      .orderBy(asc(subjects.orderIndex));

    return children;
  }

  /**
   * Get subjects with class level mapping counts
   */
  static async getSubjectsWithClassCounts(rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const allSubjects = await this.getAll();

    const subjectsWithCounts = await Promise.all(
      allSubjects.map(async (subject) => {
        const [countResult] = await db
          .select({ count: sql<number>`count(*)`.as('count') })
          .from(subjectClassMappings)
          .where(
            and(
              eq(subjectClassMappings.subjectId, subject.id),
              eq(subjectClassMappings.isActive, true)
            )
          );

        const classCount = Number(countResult?.count || 0);

        return {
          ...subject,
          classCount,
        };
      })
    );

    return subjectsWithCounts;
  }

  /**
   * Get aggregate statistics for subjects
   */
  static async getStats(rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [totalCategoriesResult, rootSubjectsResult, totalChaptersResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)`.as('count') })
        .from(subjects)
        .where(and(
          eq(subjects.isActive, true),
          eq(subjects.isCategory, true),
          isNull(subjects.parentSubjectId)
        )),
      db.select({ count: sql<number>`count(*)`.as('count') })
        .from(subjects)
        .where(and(
          eq(subjects.isActive, true),
          eq(subjects.isCategory, false),
          isNull(subjects.parentSubjectId)
        )),
      db.select({ count: sql<number>`count(*)`.as('count') })
        .from(chapters)
        .where(eq(chapters.isActive, true)),
    ]);

    return {
      totalCategories: Number(totalCategoriesResult[0]?.count || 0),
      rootSubjects: Number(rootSubjectsResult[0]?.count || 0),
      totalChapters: Number(totalChaptersResult[0]?.count || 0),
    };
  }

  /**
   * Create a child subject (sub-subject) under a category
   */
  static async createChild(
    parentSubjectId: string,
    data: {
      nameEn: string;
      nameMr: string;
      descriptionEn?: string | null;
      descriptionMr?: string | null;
      icon?: string | null;
      orderIndex?: number | null;
    },
    rlsContext?: RLSContext
  ) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    // Get parent subject
    const parent = await this.getById(parentSubjectId, rlsContext);
    if (!parent) {
      return { success: false, error: 'Parent subject not found' };
    }

    if (!parent.isCategory) {
      return { success: false, error: 'Sub-subjects can only be added to categories' };
    }

    // Generate slug from name
    const subjectSlug = `${parent.slug}-${data.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

    // Check if slug already exists
    const existing = await this.getBySlug(subjectSlug);
    if (existing) {
      return { success: false, error: 'A sub-subject with this name already exists' };
    }

    // Get highest order_index for siblings
    const siblings = await db
      .select({ orderIndex: subjects.orderIndex })
      .from(subjects)
      .where(eq(subjects.parentSubjectId, parentSubjectId))
      .orderBy(desc(subjects.orderIndex))
      .limit(1);

    const nextOrderIndex = data.orderIndex ?? ((siblings?.[0]?.orderIndex ?? 0) + 1);

    // Insert new sub-subject
    const [newSubject] = await db
      .insert(subjects)
      .values({
        parentSubjectId: parentSubjectId,
        nameEn: data.nameEn,
        nameMr: data.nameMr,
        slug: subjectSlug,
        descriptionEn: data.descriptionEn || null,
        descriptionMr: data.descriptionMr || null,
        icon: data.icon || null,
        orderIndex: nextOrderIndex,
        isActive: true,
        isCategory: false,
        isPaper: false,
      })
      .returning();

    if (!newSubject) {
      return { success: false, error: 'Failed to create sub-subject' };
    }

    return { success: true, data: newSubject };
  }

  /**
   * Update a subject by ID
   */
  static async update(
    subjectId: string,
    data: {
      nameEn?: string;
      nameMr?: string;
      descriptionEn?: string | null;
      descriptionMr?: string | null;
      icon?: string | null;
      orderIndex?: number | null;
      isActive?: boolean;
    },
    rlsContext?: RLSContext
  ) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    // Check if subject exists
    const existing = await this.getById(subjectId, rlsContext);
    if (!existing) {
      return { success: false, error: 'Subject not found' };
    }

    // Build update object
    const updateData: any = {};
    if (data.nameEn !== undefined) updateData.nameEn = data.nameEn;
    if (data.nameMr !== undefined) updateData.nameMr = data.nameMr;
    if (data.descriptionEn !== undefined) updateData.descriptionEn = data.descriptionEn;
    if (data.descriptionMr !== undefined) updateData.descriptionMr = data.descriptionMr;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.orderIndex !== undefined) updateData.orderIndex = data.orderIndex;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    updateData.updatedAt = new Date();

    const [updated] = await db
      .update(subjects)
      .set(updateData)
      .where(eq(subjects.id, subjectId))
      .returning();

    if (!updated) {
      return { success: false, error: 'Failed to update subject' };
    }

    return { success: true, data: updated };
  }
}

