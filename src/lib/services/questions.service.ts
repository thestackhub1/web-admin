/**
 * Questions Service
 * 
 * Business logic for question management.
 * Uses DbService for all database operations.
 * Handles three question tables: scholarship, english, information_technology
 */

import { dbService, type RLSContext } from './dbService';
import { eq, and, or, inArray, asc, desc, sql, count, ilike } from 'drizzle-orm';
import {
  questionsScholarship,
  questionsEnglish,
  questionsInformationTechnology,
  chapters,
  subjects,
} from '@/db/schema';

type QuestionTable = typeof questionsScholarship | typeof questionsEnglish | typeof questionsInformationTechnology;

/**
 * Map subject slug to question table
 */
function getQuestionTable(subjectSlug: string): QuestionTable | null {
  const slug = subjectSlug.toLowerCase();
  if (slug === 'scholarship') return questionsScholarship;
  if (slug === 'english') return questionsEnglish;
  if (slug === 'information-technology' || slug === 'information_technology') return questionsInformationTechnology;
  return null;
}

/**
 * Get table name for logging/debugging
 */
function getTableName(subjectSlug: string): string {
  const slug = subjectSlug.toLowerCase();
  if (slug === 'scholarship') return 'questions_scholarship';
  if (slug === 'english') return 'questions_english';
  if (slug === 'information-technology' || slug === 'information_technology') return 'questions_information_technology';
  return 'unknown';
}

/**
 * Get question table name for a subject slug (for API routes)
 * Handles both dash and underscore formats
 */
export function getQuestionTableName(subjectSlug: string): string | null {
  const table = getQuestionTable(subjectSlug);
  if (!table) return null;
  return getTableName(subjectSlug);
}

/**
 * Check if a subject is supported
 */
export function isSubjectSupported(subjectSlug: string): boolean {
  return getQuestionTable(subjectSlug) !== null;
}

export interface QuestionListOptions {
  chapterId?: string;
  difficulty?: string;
  questionType?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export class QuestionsService {
  /**
   * Get questions by subject slug
   */
  static async getBySubject(
    subjectSlug: string,
    options: QuestionListOptions = {},
    rlsContext?: RLSContext
  ) {
    const table = getQuestionTable(subjectSlug);
    if (!table) {
      throw new Error(`Invalid subject slug: ${subjectSlug}`);
    }

    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const conditions = [];

    if (options.chapterId) {
      conditions.push(eq(table.chapterId, options.chapterId));
    }

    if (options.difficulty) {
      conditions.push(eq(table.difficulty, options.difficulty));
    }

    if (options.questionType) {
      conditions.push(eq(table.questionType, options.questionType));
    }

    if (options.isActive !== undefined) {
      conditions.push(eq(table.isActive, options.isActive));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const baseQuery = db
      .select()
      .from(table)
      .where(whereClause)
      .orderBy(desc(table.createdAt))
      .$dynamic();

    if (options.limit) {
      baseQuery.limit(options.limit);
    }

    if (options.offset) {
      baseQuery.offset(options.offset);
    }

    const results = await baseQuery;

    // Transform to API format
    return results.map((q) => ({
      id: q.id,
      question_text: q.questionText,
      question_language: q.questionLanguage,
      question_type: q.questionType,
      difficulty: q.difficulty,
      answer_data: q.answerData,
      explanation: q.explanation || null,
      tags: q.tags,
      class_level: q.classLevel,
      marks: q.marks,
      chapter_id: q.chapterId,
      is_active: q.isActive,
      created_by: q.createdBy,
      created_at: q.createdAt?.toISOString(),
      updated_at: q.updatedAt?.toISOString(),
    }));
  }

  /**
   * Get questions by IDs
   */
  static async getByIds(
    subjectSlug: string,
    questionIds: string[],
    rlsContext?: RLSContext
  ) {
    if (questionIds.length === 0) {
      return [];
    }

    const table = getQuestionTable(subjectSlug);
    if (!table) {
      throw new Error(`Invalid subject slug: ${subjectSlug}`);
    }

    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const results = await db
      .select()
      .from(table)
      .where(inArray(table.id, questionIds));

    return results.map((q) => ({
      id: q.id,
      question_text: q.questionText,
      question_language: q.questionLanguage,
      question_type: q.questionType,
      difficulty: q.difficulty,
      answer_data: q.answerData,
      explanation: q.explanation || null,
      tags: q.tags,
      class_level: q.classLevel,
      marks: q.marks,
      chapter_id: q.chapterId,
      is_active: q.isActive,
      created_by: q.createdBy,
      created_at: q.createdAt?.toISOString(),
      updated_at: q.updatedAt?.toISOString(),
    }));
  }

  /**
   * Get question by ID
   */
  static async getById(
    subjectSlug: string,
    questionId: string,
    rlsContext?: RLSContext
  ) {
    const table = getQuestionTable(subjectSlug);
    if (!table) {
      throw new Error(`Invalid subject slug: ${subjectSlug}`);
    }

    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [question] = await db
      .select()
      .from(table)
      .where(eq(table.id, questionId))
      .limit(1);

    if (!question) {
      return null;
    }

    return {
      id: question.id,
      question_text: question.questionText,
      question_language: question.questionLanguage,
      question_type: question.questionType,
      difficulty: question.difficulty,
      answer_data: question.answerData,
      explanation: question.explanation || null,
      tags: question.tags,
      class_level: question.classLevel,
      marks: question.marks,
      chapter_id: question.chapterId,
      is_active: question.isActive,
      created_by: question.createdBy,
      created_at: question.createdAt?.toISOString(),
      updated_at: question.updatedAt?.toISOString(),
    };
  }

  /**
   * Get question counts by chapter for a subject
   */
  static async getQuestionCountsByChapter(
    subjectSlug: string,
    chapterId: string,
    rlsContext?: RLSContext
  ) {
    const table = getQuestionTable(subjectSlug);
    if (!table) {
      throw new Error(`Invalid subject slug: ${subjectSlug}`);
    }

    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const results = await db
      .select({
        difficulty: table.difficulty,
        questionType: table.questionType,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(table)
      .where(and(eq(table.chapterId, chapterId), eq(table.isActive, true)))
      .groupBy(table.difficulty, table.questionType);

    const counts: Record<string, Record<string, number>> = {};

    results.forEach((r) => {
      if (!counts[r.difficulty]) {
        counts[r.difficulty] = {};
      }
      counts[r.difficulty][r.questionType] = Number(r.count);
    });

    return counts;
  }

  /**
   * Get questions for section practice
   */
  static async getForSectionPractice(
    subjectSlug: string,
    sectionName: string,
    limit: number = 10,
    rlsContext?: RLSContext
  ) {
    const table = getQuestionTable(subjectSlug);
    if (!table) {
      throw new Error(`Invalid subject slug: ${subjectSlug}`);
    }

    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    // Get questions tagged with the section name or matching certain criteria
    const results = await db
      .select()
      .from(table)
      .where(
        and(
          eq(table.isActive, true),
          sql`${table.tags} @> ${JSON.stringify([sectionName])}::jsonb`
        )
      )
      .limit(limit)
      .orderBy(sql`RANDOM()`);

    return results.map((q) => ({
      id: q.id,
      question_text: q.questionText,
      question_language: q.questionLanguage,
      question_type: q.questionType,
      difficulty: q.difficulty,
      answer_data: q.answerData,
      explanation: q.explanation || null,
      tags: q.tags,
      class_level: q.classLevel,
      marks: q.marks,
      chapter_id: q.chapterId,
      is_active: q.isActive,
      created_by: q.createdBy,
      created_at: q.createdAt?.toISOString(),
      updated_at: q.updatedAt?.toISOString(),
    }));
  }

  /**
   * Get total question count for a subject
   */
  static async getCount(subjectSlug: string, options?: { isActive?: boolean }, rlsContext?: RLSContext) {
    const table = getQuestionTable(subjectSlug);
    if (!table) {
      throw new Error(`Invalid subject slug: ${subjectSlug}`);
    }

    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const conditions = [];
    if (options?.isActive !== undefined) {
      conditions.push(eq(table.isActive, options.isActive));
    }

    const [result] = await db
      .select({ count: sql<number>`count(*)`.as('count') })
      .from(table)
      .where(and(...conditions));

    return Number(result?.count || 0);
  }

  /**
   * Insert multiple questions into a subject table
   */
  static async insertQuestions(
    subjectSlug: string,
    questions: Array<{
      questionText: string;
      questionLanguage: "en" | "mr";
      questionType: string;
      difficulty: string;
      answerData: any;
      explanation?: string | null;
      chapterId?: string | null;
      classLevel: string; // Required
      marks: number;
      isActive: boolean;
      createdBy: string;
    }>,
    rlsContext?: RLSContext
  ) {
    const table = getQuestionTable(subjectSlug);
    if (!table) {
      throw new Error(`Invalid subject slug: ${subjectSlug}`);
    }

    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const insertedQuestions = await db
      .insert(table)
      .values(questions)
      .returning({ id: table.id });

    return insertedQuestions;
  }

  /**
   * Create a new question
   */
  static async create(
    subjectSlug: string,
    data: {
      questionText: string;
      questionLanguage: 'en' | 'mr';
      questionType: string;
      difficulty: string;
      chapterId?: string | null;
      answerData: any;
      explanation?: string | null;
      tags?: string[];
      classLevel: string; // Required
      marks?: number;
      isActive?: boolean;
      createdBy?: string;
    },
    rlsContext?: RLSContext
  ) {
    const table = getQuestionTable(subjectSlug);
    if (!table) {
      throw new Error(`Invalid subject slug: ${subjectSlug}`);
    }

    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [question] = await db
      .insert(table)
      .values({
        questionText: data.questionText,
        questionLanguage: data.questionLanguage,
        questionType: data.questionType,
        difficulty: data.difficulty,
        chapterId: data.chapterId || null,
        answerData: data.answerData,
        explanation: data.explanation || null,
        tags: data.tags || [],
        classLevel: data.classLevel, // Required
        marks: data.marks || 1,
        isActive: data.isActive ?? true,
        createdBy: data.createdBy || rlsContext?.userId,
      })
      .returning();

    return { success: true, data: question };
  }

  /**
   * Update a question
   */
  static async update(
    subjectSlug: string,
    questionId: string,
    data: Partial<{
      questionText: string;
      questionLanguage: 'en' | 'mr';
      questionType: string;
      difficulty: string;
      chapterId?: string | null;
      answerData: any;
      explanation?: string | null;
      tags?: string[];
      classLevel?: string; // Optional for updates, but should be provided if updating
      marks?: number;
      isActive?: boolean;
    }>,
    rlsContext?: RLSContext
  ) {
    const table = getQuestionTable(subjectSlug);
    if (!table) {
      throw new Error(`Invalid subject slug: ${subjectSlug}`);
    }

    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const updateValues: any = {};
    if (data.questionText !== undefined) updateValues.questionText = data.questionText;
    if (data.questionLanguage !== undefined) updateValues.questionLanguage = data.questionLanguage;
    if (data.questionType !== undefined) updateValues.questionType = data.questionType;
    if (data.difficulty !== undefined) updateValues.difficulty = data.difficulty;
    if (data.chapterId !== undefined) updateValues.chapterId = data.chapterId;
    if (data.answerData !== undefined) updateValues.answerData = data.answerData;
    if (data.explanation !== undefined) updateValues.explanation = data.explanation;
    if (data.tags !== undefined) updateValues.tags = data.tags;
    if (data.classLevel !== undefined) updateValues.classLevel = data.classLevel;
    if (data.marks !== undefined) updateValues.marks = data.marks;
    if (data.isActive !== undefined) updateValues.isActive = data.isActive;
    updateValues.updatedAt = new Date();

    const [updated] = await db
      .update(table)
      .set(updateValues)
      .where(eq(table.id, questionId))
      .returning();

    if (!updated) {
      return { success: false, error: 'Question not found' };
    }

    return { success: true, data: updated };
  }

  /**
   * Delete a question (soft delete)
   */
  static async delete(subjectSlug: string, questionId: string, rlsContext?: RLSContext) {
    const table = getQuestionTable(subjectSlug);
    if (!table) {
      throw new Error(`Invalid subject slug: ${subjectSlug}`);
    }

    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [deleted] = await db
      .update(table)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(table.id, questionId))
      .returning();

    if (!deleted) {
      return { success: false, error: 'Question not found' };
    }

    return { success: true };
  }
  /**
   * Get questions from ALL tables (merged)
   * This is a utility for the "All Questions" view.
   * Note: Pagination is approximate when fetching across multiple tables without a unified view.
   */
  static async getAll(
    options: QuestionListOptions & { search?: string, limit?: number, offset?: number } = {},
    rlsContext?: RLSContext
  ) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const subjects = [
      { slug: 'scholarship', name: 'Scholarship', table: questionsScholarship },
      { slug: 'english', name: 'English', table: questionsEnglish },
      { slug: 'information-technology', name: 'Information Technology', table: questionsInformationTechnology }
    ];

    const allQueries = subjects.map(async ({ slug, name, table }) => {
      const conditions = [];

      if (options.chapterId) conditions.push(eq(table.chapterId, options.chapterId));
      if (options.difficulty) conditions.push(eq(table.difficulty, options.difficulty));
      if (options.questionType) conditions.push(eq(table.questionType, options.questionType));

      if (options.isActive !== undefined) {
        conditions.push(eq(table.isActive, options.isActive));
      }

      if (options.search) {
        conditions.push(ilike(table.questionText, `%${options.search}%`));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // We fetch slightly more than limit per table to ensure we have enough after merging
      // For proper global pagination, we'd need a different architecture, but this suffices for admin dashboard "scan"
      const limit = options.limit || 20;

      const results = await db
        .select()
        .from(table)
        .where(whereClause)
        .orderBy(desc(table.createdAt))
        .limit(limit);

      return results.map(q => ({
        ...q,
        subject: { slug, name }
      }));
    });

    const nestedResults = await Promise.all(allQueries);
    const flatResults = nestedResults.flat();

    // Sort combined results by createdAt desc
    flatResults.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    // Apply global pagination after merge (inefficient for deep pages, but functional for first few pages)
    const effectiveOffset = 0; // The individual queries limited usage, so we just slice the top blended results
    const results = flatResults.slice(0, options.limit || 20);

    return results.map((q) => ({
      id: q.id,
      question_text: q.questionText,
      question_language: q.questionLanguage,
      question_type: q.questionType,
      difficulty: q.difficulty,
      answer_data: q.answerData,
      explanation: q.explanation || null,
      tags: q.tags,
      class_level: q.classLevel,
      marks: q.marks,
      chapter_id: q.chapterId,
      is_active: q.isActive,
      created_by: q.createdBy,
      created_at: q.createdAt?.toISOString(),
      updated_at: q.updatedAt?.toISOString(),
      subject: q.subject
    }));
  }
}

