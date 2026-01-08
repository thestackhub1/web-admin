/**
 * Exam Structures Service
 * 
 * Business logic for exam structure (blueprint) management.
 * Uses DbService for all database operations.
 */

import { dbService, type RLSContext } from './dbService';
import { eq, and, asc } from 'drizzle-orm';
import { examStructures, subjects, type ExamStructure } from '@/db/schema';

export class ExamStructuresService {
  /**
   * Get all active exam structures
   * Optionally filtered by subject ID
   */
  static async getAll(options?: { subjectId?: string }) {
    const db = await dbService.getDb();

    let query = db
      .select({
        id: examStructures.id,
        subjectId: examStructures.subjectId,
        nameEn: examStructures.nameEn,
        nameMr: examStructures.nameMr,
        descriptionEn: examStructures.descriptionEn,
        descriptionMr: examStructures.descriptionMr,
        classLevel: examStructures.classLevel,
        durationMinutes: examStructures.durationMinutes,
        totalQuestions: examStructures.totalQuestions,
        totalMarks: examStructures.totalMarks,
        passingPercentage: examStructures.passingPercentage,
        sections: examStructures.sections,
        orderIndex: examStructures.orderIndex,
        subject: {
          id: subjects.id,
          nameEn: subjects.nameEn,
          nameMr: subjects.nameMr,
          slug: subjects.slug,
        },
      })
      .from(examStructures)
      .leftJoin(subjects, eq(examStructures.subjectId, subjects.id))
      .where(eq(examStructures.isActive, true))
      .orderBy(asc(examStructures.orderIndex));

    // Note: Drizzle doesn't support dynamic where clauses easily
    // We'll filter in memory for subjectId if provided
    const results = await query;

    // Transform to match API response format (nested subjects object)
    let filtered = results.map((r) => ({
      id: r.id,
      subject_id: r.subjectId,
      name_en: r.nameEn,
      name_mr: r.nameMr,
      description_en: r.descriptionEn,
      description_mr: r.descriptionMr,
      class_level: r.classLevel,
      duration_minutes: r.durationMinutes,
      total_questions: r.totalQuestions,
      total_marks: r.totalMarks,
      passing_percentage: r.passingPercentage,
      sections: r.sections,
      order_index: r.orderIndex,
      subjects: r.subject?.id
        ? {
            id: r.subject.id,
            name_en: r.subject.nameEn,
            name_mr: r.subject.nameMr,
            slug: r.subject.slug,
          }
        : null,
    }));

    // Filter by subjectId if provided
    if (options?.subjectId) {
      filtered = filtered.filter((es) => es.subject_id === options.subjectId);
    }

    return filtered;
  }

  /**
   * Get exam structure by ID
   */
  static async getById(examStructureId: string, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [examStructure] = await db
      .select()
      .from(examStructures)
      .where(and(eq(examStructures.id, examStructureId), eq(examStructures.isActive, true)))
      .limit(1);

    return examStructure || null;
  }

  /**
   * Create a new exam structure
   */
  static async create(data: {
    subjectId: string;
    classLevelId?: string | null;
    nameEn: string;
    nameMr: string;
    descriptionEn?: string | null;
    descriptionMr?: string | null;
    classLevel?: string | null;
    durationMinutes: number;
    totalQuestions: number;
    totalMarks: number;
    passingPercentage: number;
    sections?: any[];
    isTemplate?: boolean;
    orderIndex?: number;
    isActive?: boolean;
  }, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [examStructure] = await db
      .insert(examStructures)
      .values({
        subjectId: data.subjectId,
        classLevelId: data.classLevelId || null,
        nameEn: data.nameEn,
        nameMr: data.nameMr,
        descriptionEn: data.descriptionEn || null,
        descriptionMr: data.descriptionMr || null,
        classLevel: data.classLevel || null,
        durationMinutes: data.durationMinutes,
        totalQuestions: data.totalQuestions,
        totalMarks: data.totalMarks,
        passingPercentage: data.passingPercentage,
        sections: data.sections || [],
        isTemplate: data.isTemplate || false,
        orderIndex: data.orderIndex || 0,
        isActive: data.isActive ?? true,
      })
      .returning();

    return { success: true, data: examStructure };
  }

  /**
   * Update an exam structure
   */
  static async update(
    examStructureId: string,
    data: Partial<{
      subjectId: string;
      classLevelId?: string | null;
      nameEn: string;
      nameMr: string;
      descriptionEn?: string | null;
      descriptionMr?: string | null;
      classLevel?: string | null;
      durationMinutes: number;
      totalQuestions: number;
      totalMarks: number;
      passingPercentage: number;
      sections?: any[];
      isTemplate?: boolean;
      orderIndex?: number;
      isActive?: boolean;
    }>,
    rlsContext?: RLSContext
  ) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [updated] = await db
      .update(examStructures)
      .set({
        ...(data.subjectId !== undefined && { subjectId: data.subjectId }),
        ...(data.classLevelId !== undefined && { classLevelId: data.classLevelId }),
        ...(data.nameEn !== undefined && { nameEn: data.nameEn }),
        ...(data.nameMr !== undefined && { nameMr: data.nameMr }),
        ...(data.descriptionEn !== undefined && { descriptionEn: data.descriptionEn }),
        ...(data.descriptionMr !== undefined && { descriptionMr: data.descriptionMr }),
        ...(data.classLevel !== undefined && { classLevel: data.classLevel }),
        ...(data.durationMinutes !== undefined && { durationMinutes: data.durationMinutes }),
        ...(data.totalQuestions !== undefined && { totalQuestions: data.totalQuestions }),
        ...(data.totalMarks !== undefined && { totalMarks: data.totalMarks }),
        ...(data.passingPercentage !== undefined && { passingPercentage: data.passingPercentage }),
        ...(data.sections !== undefined && { sections: data.sections }),
        ...(data.isTemplate !== undefined && { isTemplate: data.isTemplate }),
        ...(data.orderIndex !== undefined && { orderIndex: data.orderIndex }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        updatedAt: new Date(),
      })
      .where(eq(examStructures.id, examStructureId))
      .returning();

    if (!updated) {
      return { success: false, error: 'Exam structure not found' };
    }

    return { success: true, data: updated };
  }

  /**
   * Delete an exam structure (soft delete by setting isActive to false)
   */
  static async delete(examStructureId: string, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [deleted] = await db
      .update(examStructures)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(examStructures.id, examStructureId))
      .returning();

    if (!deleted) {
      return { success: false, error: 'Exam structure not found' };
    }

    return { success: true };
  }
}

