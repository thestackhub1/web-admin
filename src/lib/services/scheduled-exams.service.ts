/**
 * Scheduled Exams Service
 * 
 * Business logic for scheduled exam management.
 * Uses DbService for all database operations.
 */

import { dbService, type RLSContext } from './dbService';
import { eq, and, or, inArray, asc, desc, ilike } from 'drizzle-orm';
import { scheduledExams, classLevels, subjects, examStructures, exams } from '@/db/schema';

export interface ScheduledExamListOptions {
  subjectId?: string;
  subjectSlug?: string;
  classLevelId?: string;
  status?: string;
}

export class ScheduledExamsService {
  /**
   * Get all scheduled exams with filters
   */
  static async getAll(options: ScheduledExamListOptions = {}, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    // Resolve subject slug to ID if needed
    let resolvedSubjectId = options.subjectId;
    if (options.subjectSlug && !options.subjectId) {
      const [subject] = await db
        .select({ id: subjects.id })
        .from(subjects)
        .where(and(eq(subjects.slug, options.subjectSlug), eq(subjects.isActive, true)))
        .limit(1);
      
      if (subject) {
        resolvedSubjectId = subject.id;
      }
    }

    // Build query with joins
    let query = db
      .select({
        id: scheduledExams.id,
        nameEn: scheduledExams.nameEn,
        nameMr: scheduledExams.nameMr,
        descriptionEn: scheduledExams.descriptionEn,
        descriptionMr: scheduledExams.descriptionMr,
        totalMarks: scheduledExams.totalMarks,
        durationMinutes: scheduledExams.durationMinutes,
        scheduledDate: scheduledExams.scheduledDate,
        scheduledTime: scheduledExams.scheduledTime,
        status: scheduledExams.status,
        orderIndex: scheduledExams.orderIndex,
        classLevelId: scheduledExams.classLevelId,
        subjectId: scheduledExams.subjectId,
        examStructureId: scheduledExams.examStructureId,
        maxAttempts: scheduledExams.maxAttempts,
        classLevel: {
          id: classLevels.id,
          nameEn: classLevels.nameEn,
          nameMr: classLevels.nameMr,
          slug: classLevels.slug,
        },
        subject: {
          id: subjects.id,
          nameEn: subjects.nameEn,
          nameMr: subjects.nameMr,
          slug: subjects.slug,
        },
        examStructure: {
          id: examStructures.id,
          nameEn: examStructures.nameEn,
          nameMr: examStructures.nameMr,
          totalMarks: examStructures.totalMarks,
          totalQuestions: examStructures.totalQuestions,
          durationMinutes: examStructures.durationMinutes,
          sections: examStructures.sections,
        },
      })
      .from(scheduledExams)
      .leftJoin(classLevels, eq(scheduledExams.classLevelId, classLevels.id))
      .leftJoin(subjects, eq(scheduledExams.subjectId, subjects.id))
      .leftJoin(examStructures, eq(scheduledExams.examStructureId, examStructures.id));

    // Apply filters
    const conditions: ReturnType<typeof eq>[] = [eq(scheduledExams.isActive, true)];

    if (resolvedSubjectId) {
      conditions.push(eq(scheduledExams.subjectId, resolvedSubjectId));
    }

    if (options.classLevelId) {
      conditions.push(eq(scheduledExams.classLevelId, options.classLevelId));
    }

    if (options.status && options.status !== 'all') {
      conditions.push(eq(scheduledExams.status, options.status));
    }

    const results = await query
      .where(and(...conditions))
      .orderBy(asc(scheduledExams.orderIndex));

    // Transform to API format
    return results.map((r) => ({
      id: r.id,
      name_en: r.nameEn,
      name_mr: r.nameMr,
      description_en: r.descriptionEn,
      description_mr: r.descriptionMr,
      total_marks: r.totalMarks,
      duration_minutes: r.durationMinutes,
      scheduled_date: r.scheduledDate,
      scheduled_time: r.scheduledTime,
      status: r.status,
      order_index: r.orderIndex,
      class_level_id: r.classLevelId,
      subject_id: r.subjectId,
      exam_structure_id: r.examStructureId,
      max_attempts: r.maxAttempts,
      class_levels: r.classLevel?.id ? r.classLevel : null,
      subjects: r.subject?.id ? r.subject : null,
      exam_structures: r.examStructure?.id ? r.examStructure : null,
    }));
  }

  /**
   * Get scheduled exam by ID
   */
  static async getById(examId: string, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [exam] = await db
      .select({
        id: scheduledExams.id,
        nameEn: scheduledExams.nameEn,
        nameMr: scheduledExams.nameMr,
        descriptionEn: scheduledExams.descriptionEn,
        descriptionMr: scheduledExams.descriptionMr,
        totalMarks: scheduledExams.totalMarks,
        durationMinutes: scheduledExams.durationMinutes,
        scheduledDate: scheduledExams.scheduledDate,
        scheduledTime: scheduledExams.scheduledTime,
        status: scheduledExams.status,
        orderIndex: scheduledExams.orderIndex,
        classLevelId: scheduledExams.classLevelId,
        subjectId: scheduledExams.subjectId,
        examStructureId: scheduledExams.examStructureId,
        maxAttempts: scheduledExams.maxAttempts,
        publishResults: scheduledExams.publishResults,
        isActive: scheduledExams.isActive,
        classLevel: {
          id: classLevels.id,
          nameEn: classLevels.nameEn,
          nameMr: classLevels.nameMr,
          slug: classLevels.slug,
        },
        subject: {
          id: subjects.id,
          nameEn: subjects.nameEn,
          nameMr: subjects.nameMr,
          slug: subjects.slug,
        },
        examStructure: {
          id: examStructures.id,
          nameEn: examStructures.nameEn,
          nameMr: examStructures.nameMr,
          totalMarks: examStructures.totalMarks,
          totalQuestions: examStructures.totalQuestions,
          durationMinutes: examStructures.durationMinutes,
          sections: examStructures.sections,
        },
      })
      .from(scheduledExams)
      .leftJoin(classLevels, eq(scheduledExams.classLevelId, classLevels.id))
      .leftJoin(subjects, eq(scheduledExams.subjectId, subjects.id))
      .leftJoin(examStructures, eq(scheduledExams.examStructureId, examStructures.id))
      .where(and(eq(scheduledExams.id, examId), eq(scheduledExams.isActive, true)))
      .limit(1);

    if (!exam) {
      return null;
    }

    // Get attempt counts
    const attemptCounts = await db
      .select({
        scheduledExamId: exams.scheduledExamId,
        count: exams.id,
      })
      .from(exams)
      .where(eq(exams.scheduledExamId, examId));

    const totalAttempts = attemptCounts.length;
    const completedAttempts = attemptCounts.filter(a => a.scheduledExamId === examId).length;

    return {
      id: exam.id,
      name_en: exam.nameEn,
      name_mr: exam.nameMr,
      description_en: exam.descriptionEn,
      description_mr: exam.descriptionMr,
      total_marks: exam.totalMarks,
      duration_minutes: exam.durationMinutes,
      scheduled_date: exam.scheduledDate,
      scheduled_time: exam.scheduledTime,
      status: exam.status,
      order_index: exam.orderIndex,
      class_level_id: exam.classLevelId,
      subject_id: exam.subjectId,
      exam_structure_id: exam.examStructureId,
      max_attempts: exam.maxAttempts,
      publish_results: exam.publishResults,
      is_active: exam.isActive,
      class_levels: exam.classLevel?.id ? exam.classLevel : null,
      subjects: exam.subject?.id ? exam.subject : null,
      exam_structures: exam.examStructure?.id ? exam.examStructure : null,
      attempts_count: totalAttempts,
      completed_attempts: completedAttempts,
    };
  }

  /**
   * Get scheduled exams for a class level
   */
  static async getByClassLevel(classLevelId: string, options?: { subjectId?: string }, rlsContext?: RLSContext) {
    return this.getAll(
      {
        classLevelId,
        subjectId: options?.subjectId,
        status: 'published',
      },
      rlsContext
    );
  }

  /**
   * Get user's attempt counts for scheduled exams
   */
  static async getUserAttemptCounts(examIds: string[], userId: string, rlsContext?: RLSContext) {
    if (examIds.length === 0) {
      return { attemptCounts: {}, inProgressExams: {} };
    }

    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [completedAttempts, inProgressAttempts] = await Promise.all([
      db
        .select({
          scheduledExamId: exams.scheduledExamId,
        })
        .from(exams)
        .where(
          and(
            inArray(exams.scheduledExamId, examIds),
            eq(exams.userId, userId),
            eq(exams.status, 'completed')
          )
        ),
      db
        .select({
          scheduledExamId: exams.scheduledExamId,
        })
        .from(exams)
        .where(
          and(
            inArray(exams.scheduledExamId, examIds),
            eq(exams.userId, userId),
            eq(exams.status, 'in_progress')
          )
        ),
    ]);

    const attemptCounts: Record<string, number> = {};
    completedAttempts.forEach((attempt) => {
      if (attempt.scheduledExamId) {
        attemptCounts[attempt.scheduledExamId] = (attemptCounts[attempt.scheduledExamId] || 0) + 1;
      }
    });

    const inProgressExams: Record<string, boolean> = {};
    inProgressAttempts.forEach((attempt) => {
      if (attempt.scheduledExamId) {
        inProgressExams[attempt.scheduledExamId] = true;
      }
    });

    return { attemptCounts, inProgressExams };
  }

  /**
   * Get exam attempt statistics for a scheduled exam
   */
  static async getExamStats(examId: string, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [allAttempts, completedAttempts] = await Promise.all([
      db.select().from(exams).where(eq(exams.scheduledExamId, examId)),
      db.select().from(exams).where(and(
        eq(exams.scheduledExamId, examId),
        eq(exams.status, 'completed')
      )),
    ]);

    return {
      totalAttempts: allAttempts.length,
      completedAttempts: completedAttempts.length,
    };
  }

  /**
   * Create a new scheduled exam
   */
  static async create(data: {
    nameEn: string;
    nameMr: string;
    descriptionEn?: string | null;
    descriptionMr?: string | null;
    classLevelId: string;
    subjectId: string;
    examStructureId?: string | null;
    totalMarks: number;
    durationMinutes: number;
    scheduledDate?: string | null;
    scheduledTime?: string | null;
    status?: string;
    orderIndex?: number;
    isActive?: boolean;
    publishResults?: boolean;
    maxAttempts?: number;
  }, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    // Get max order index for this class/subject combination
    const existing = await db
      .select({ orderIndex: scheduledExams.orderIndex })
      .from(scheduledExams)
      .where(and(
        eq(scheduledExams.classLevelId, data.classLevelId),
        eq(scheduledExams.subjectId, data.subjectId)
      ))
      .orderBy(desc(scheduledExams.orderIndex))
      .limit(1);

    const nextOrderIndex = (existing[0]?.orderIndex || 0) + 1;

    const [exam] = await db
      .insert(scheduledExams)
      .values({
        nameEn: data.nameEn,
        nameMr: data.nameMr,
        descriptionEn: data.descriptionEn || null,
        descriptionMr: data.descriptionMr || null,
        classLevelId: data.classLevelId,
        subjectId: data.subjectId,
        examStructureId: data.examStructureId || null,
        totalMarks: data.totalMarks,
        durationMinutes: data.durationMinutes,
        scheduledDate: data.scheduledDate || null,
        scheduledTime: data.scheduledTime || null,
        status: data.status || 'draft',
        orderIndex: data.orderIndex ?? nextOrderIndex,
        isActive: data.isActive ?? true,
        publishResults: data.publishResults ?? false,
        maxAttempts: data.maxAttempts ?? 0,
      })
      .returning();

    return { success: true, data: exam };
  }

  /**
   * Update a scheduled exam
   */
  static async update(
    examId: string,
    data: Partial<{
      nameEn: string;
      nameMr: string;
      descriptionEn?: string | null;
      descriptionMr?: string | null;
      classLevelId: string;
      subjectId: string;
      examStructureId?: string | null;
      totalMarks: number;
      durationMinutes: number;
      scheduledDate?: string | null;
      scheduledTime?: string | null;
      status?: string;
      orderIndex?: number;
      isActive?: boolean;
      publishResults?: boolean;
      maxAttempts?: number;
    }>,
    rlsContext?: RLSContext
  ) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const updateValues: any = {};
    if (data.nameEn !== undefined) updateValues.nameEn = data.nameEn;
    if (data.nameMr !== undefined) updateValues.nameMr = data.nameMr;
    if (data.descriptionEn !== undefined) updateValues.descriptionEn = data.descriptionEn;
    if (data.descriptionMr !== undefined) updateValues.descriptionMr = data.descriptionMr;
    if (data.classLevelId !== undefined) updateValues.classLevelId = data.classLevelId;
    if (data.subjectId !== undefined) updateValues.subjectId = data.subjectId;
    if (data.examStructureId !== undefined) updateValues.examStructureId = data.examStructureId;
    if (data.totalMarks !== undefined) updateValues.totalMarks = data.totalMarks;
    if (data.durationMinutes !== undefined) updateValues.durationMinutes = data.durationMinutes;
    if (data.scheduledDate !== undefined) updateValues.scheduledDate = data.scheduledDate;
    if (data.scheduledTime !== undefined) updateValues.scheduledTime = data.scheduledTime;
    if (data.status !== undefined) updateValues.status = data.status;
    if (data.orderIndex !== undefined) updateValues.orderIndex = data.orderIndex;
    if (data.isActive !== undefined) updateValues.isActive = data.isActive;
    if (data.publishResults !== undefined) updateValues.publishResults = data.publishResults;
    if (data.maxAttempts !== undefined) updateValues.maxAttempts = data.maxAttempts;
    updateValues.updatedAt = new Date();

    const [updated] = await db
      .update(scheduledExams)
      .set(updateValues)
      .where(eq(scheduledExams.id, examId))
      .returning();

    if (!updated) {
      return { success: false, error: 'Scheduled exam not found' };
    }

    return { success: true, data: updated };
  }

  /**
   * Delete a scheduled exam (soft delete)
   */
  static async delete(examId: string, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [deleted] = await db
      .update(scheduledExams)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(scheduledExams.id, examId))
      .returning();

    if (!deleted) {
      return { success: false, error: 'Scheduled exam not found' };
    }

    return { success: true };
  }
}

