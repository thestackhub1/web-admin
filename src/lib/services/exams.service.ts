/**
 * Exams Service
 * 
 * Business logic for exam attempts management.
 * Uses DbService for all database operations.
 */

import { dbService, type RLSContext } from './dbService';
import { eq, and, desc } from 'drizzle-orm';
import { exams, profiles, subjects, examStructures, scheduledExams, classLevels, examAnswers } from '@/db/schema';

export interface ExamListOptions {
  userId?: string;
  subjectId?: string;
  status?: string;
  classLevelId?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export class ExamsService {
  /**
   * Get all exam attempts with pagination and filtering
   */
  static async getAll(options: ExamListOptions = {}, rlsContext?: RLSContext): Promise<PaginatedResult<any>> {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const page = options.page || 1;
    const pageSize = options.pageSize || 20;
    const offset = (page - 1) * pageSize;

    // Build where conditions
    const conditions = [];

    if (options.userId) {
      conditions.push(eq(exams.userId, options.userId));
    }

    if (options.subjectId) {
      conditions.push(eq(exams.subjectId, options.subjectId));
    }

    if (options.status) {
      conditions.push(eq(exams.status, options.status as any));
    }

    if (options.classLevelId) {
      conditions.push(eq(scheduledExams.classLevelId, options.classLevelId));
    }

    // Students can only see their own exams
    if (rlsContext?.role === 'student' && !options.userId) {
      conditions.push(eq(exams.userId, rlsContext.userId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countQuery = db
      .select({ count: exams.id })
      .from(exams)
      .where(whereClause);

    const allResults = await countQuery;
    const totalItems = allResults.length;

    // Get paginated results with joins
    let query = db
      .select({
        id: exams.id,
        userId: exams.userId,
        status: exams.status,
        score: exams.score,
        totalMarks: exams.totalMarks,
        percentage: exams.percentage,
        startedAt: exams.startedAt,
        completedAt: exams.completedAt,
        subjectId: exams.subjectId,
        examStructureId: exams.examStructureId,
        scheduledExamId: exams.scheduledExamId,
        profile: {
          id: profiles.id,
          name: profiles.name,
          email: profiles.email,
          avatarUrl: profiles.avatarUrl,
          phone: profiles.phone,
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
          passingPercentage: examStructures.passingPercentage,
        },
        scheduledExam: {
          id: scheduledExams.id,
          nameEn: scheduledExams.nameEn,
          nameMr: scheduledExams.nameMr,
        },
        classLevel: {
          id: classLevels.id,
          nameEn: classLevels.nameEn,
          nameMr: classLevels.nameMr,
          slug: classLevels.slug,
        },
      })
      .from(exams)
      .leftJoin(profiles, eq(exams.userId, profiles.id))
      .leftJoin(subjects, eq(exams.subjectId, subjects.id))
      .leftJoin(examStructures, eq(exams.examStructureId, examStructures.id))
      .leftJoin(scheduledExams, eq(exams.scheduledExamId, scheduledExams.id))
      .leftJoin(classLevels, eq(scheduledExams.classLevelId, classLevels.id))
      .where(whereClause)
      .orderBy(desc(exams.startedAt))
      .limit(pageSize)
      .offset(offset);

    const results = await query;

    // Transform to snake_case
    const items = results.map((exam) => ({
      id: exam.id,
      user_id: exam.userId,
      status: exam.status,
      score: exam.score,
      total_marks: exam.totalMarks,
      percentage: exam.percentage ? Number(exam.percentage) : null,
      started_at: exam.startedAt?.toISOString() || null,
      completed_at: exam.completedAt?.toISOString() || null,
      subject_id: exam.subjectId,
      exam_structure_id: exam.examStructureId,
      scheduled_exam_id: exam.scheduledExamId,
      profiles: exam.profile ? {
        id: exam.profile.id,
        name: exam.profile.name,
        email: exam.profile.email,
        avatar_url: exam.profile.avatarUrl,
        phone: exam.profile.phone,
      } : null,
      subjects: exam.subject ? {
        id: exam.subject.id,
        name_en: exam.subject.nameEn,
        name_mr: exam.subject.nameMr,
        slug: exam.subject.slug,
      } : null,
      exam_structures: exam.examStructure ? {
        id: exam.examStructure.id,
        name_en: exam.examStructure.nameEn,
        name_mr: exam.examStructure.nameMr,
        passing_percentage: exam.examStructure.passingPercentage,
      } : null,
      scheduled_exams: exam.scheduledExam ? {
        id: exam.scheduledExam.id,
        name_en: exam.scheduledExam.nameEn,
        name_mr: exam.scheduledExam.nameMr,
        class_levels: exam.classLevel?.id ? {
          id: exam.classLevel.id,
          name_en: exam.classLevel.nameEn,
          name_mr: exam.classLevel.nameMr,
          slug: exam.classLevel.slug,
        } : null,
      } : null,
    }));

    return {
      items,
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    };
  }

  /**
   * Get exam attempt by ID
   */
  static async getById(examId: string, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [exam] = await db
      .select({
        id: exams.id,
        userId: exams.userId,
        status: exams.status,
        score: exams.score,
        totalMarks: exams.totalMarks,
        percentage: exams.percentage,
        startedAt: exams.startedAt,
        completedAt: exams.completedAt,
        subjectId: exams.subjectId,
        examStructureId: exams.examStructureId,
        scheduledExamId: exams.scheduledExamId,
        profile: {
          id: profiles.id,
          name: profiles.name,
          email: profiles.email,
          avatarUrl: profiles.avatarUrl,
          phone: profiles.phone,
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
          passingPercentage: examStructures.passingPercentage,
        },
        scheduledExam: {
          id: scheduledExams.id,
          nameEn: scheduledExams.nameEn,
          nameMr: scheduledExams.nameMr,
        },
        classLevel: {
          id: classLevels.id,
          nameEn: classLevels.nameEn,
          nameMr: classLevels.nameMr,
          slug: classLevels.slug,
        },
      })
      .from(exams)
      .leftJoin(profiles, eq(exams.userId, profiles.id))
      .leftJoin(subjects, eq(exams.subjectId, subjects.id))
      .leftJoin(examStructures, eq(exams.examStructureId, examStructures.id))
      .leftJoin(scheduledExams, eq(exams.scheduledExamId, scheduledExams.id))
      .leftJoin(classLevels, eq(scheduledExams.classLevelId, classLevels.id))
      .where(eq(exams.id, examId))
      .limit(1);

    if (!exam) {
      return null;
    }

    // Students can only see their own exams
    if (rlsContext?.role === 'student' && exam.userId !== rlsContext.userId) {
      return null;
    }

    return {
      id: exam.id,
      userId: exam.userId,
      status: exam.status,
      score: exam.score,
      totalMarks: exam.totalMarks,
      percentage: exam.percentage,
      startedAt: exam.startedAt,
      completedAt: exam.completedAt,
      subjectId: exam.subjectId,
      examStructureId: exam.examStructureId,
      scheduledExamId: exam.scheduledExamId,
      profile: exam.profile,
      subject: exam.subject,
      examStructure: exam.examStructure,
      scheduledExam: exam.scheduledExam,
      classLevel: exam.classLevel,
    };
  }

  /**
   * Delete exam attempt
   */
  static async delete(examId: string, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    // Check if exam exists and user has permission
    const exam = await this.getById(examId, rlsContext);
    if (!exam) {
      return { success: false, error: 'Exam not found or access denied' };
    }

    // Only admin can delete exams
    if (rlsContext?.role !== 'admin' && rlsContext?.role !== 'super_admin') {
      return { success: false, error: 'Only admins can delete exam attempts' };
    }

    // Delete exam (cascade will delete answers)
    await db.delete(exams).where(eq(exams.id, examId));

    return { success: true };
  }

  /**
   * Get exam statistics for a user
   */
  static async getUserExamStats(userId: string, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [allExams, completedExams] = await Promise.all([
      db.select().from(exams).where(eq(exams.userId, userId)),
      db.select().from(exams).where(and(eq(exams.userId, userId), eq(exams.status, 'completed'))).limit(10),
    ]);

    const total = allExams.length;
    const completed = allExams.filter(e => e.status === 'completed').length;
    const allCompletedExams = allExams.filter(e => e.status === 'completed');
    const passed = allCompletedExams.filter(e => e.score && e.totalMarks && (e.score / e.totalMarks) >= 0.35).length;
    const avgScore = allCompletedExams.length > 0
      ? Math.round(allCompletedExams.reduce((acc, e) => acc + ((e.score || 0) / (e.totalMarks || 1)) * 100, 0) / allCompletedExams.length)
      : 0;

    return {
      total,
      completed,
      passed,
      avgScore,
      recentExams: completedExams.map((exam) => ({
        id: exam.id,
        status: exam.status,
        score: exam.score,
        totalMarks: exam.totalMarks,
        percentage: exam.percentage ? Number(exam.percentage) : null,
        startedAt: exam.startedAt?.toISOString(),
        completedAt: exam.completedAt?.toISOString(),
      })),
    };
  }

  /**
   * Get exam answers for an exam attempt
   */
  static async getAnswers(examId: string, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const answers = await db
      .select()
      .from(examAnswers)
      .where(eq(examAnswers.examId, examId))
      .orderBy(examAnswers.createdAt);

    return answers;
  }
}

