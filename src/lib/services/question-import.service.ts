/**
 * Question Import Service
 * 
 * Business logic for question import batch management.
 * Uses DbService for all database operations.
 */

import { dbService, type RLSContext } from './dbService';
import { eq, and, desc } from 'drizzle-orm';
import { questionImportBatches } from '@/db/schema';
import { generateId } from '@/db/utils/id';

export interface QuestionImportBatchCreateData {
  subjectSlug: string;
  batchName?: string;
  parsedQuestions: any[];
  metadata?: any;
  createdBy: string;
}

export interface QuestionImportBatchUpdateData {
  batchName?: string;
  parsedQuestions?: any[];
  status?: 'pending' | 'reviewed' | 'imported' | 'cancelled';
  metadata?: any;
}

export class QuestionImportService {
  /**
   * Create a new import batch
   */
  static async createBatch(data: QuestionImportBatchCreateData, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [batch] = await db
      .insert(questionImportBatches)
      .values({
        id: generateId(),
        subjectSlug: data.subjectSlug,
        batchName: data.batchName,
        parsedQuestions: data.parsedQuestions,
        metadata: data.metadata,
        createdBy: data.createdBy,
        status: 'pending',
      })
      .returning();

    return {
      id: batch.id,
      subject_slug: batch.subjectSlug,
      batch_name: batch.batchName,
      status: batch.status,
      parsed_questions: batch.parsedQuestions,
      metadata: batch.metadata,
      created_by: batch.createdBy,
      created_at: batch.createdAt || null,
      updated_at: batch.updatedAt || null,
    };
  }

  /**
   * Get batch by ID
   */
  static async getBatchById(batchId: string, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [batch] = await db
      .select()
      .from(questionImportBatches)
      .where(eq(questionImportBatches.id, batchId))
      .limit(1);

    if (!batch) {
      return null;
    }

    return {
      id: batch.id,
      subject_slug: batch.subjectSlug,
      batch_name: batch.batchName,
      status: batch.status,
      parsed_questions: batch.parsedQuestions,
      metadata: batch.metadata,
      created_by: batch.createdBy,
      created_at: batch.createdAt || null,
      updated_at: batch.updatedAt || null,
      imported_at: batch.importedAt || null,
    };
  }

  /**
   * Update batch
   */
  static async updateBatch(
    batchId: string,
    data: QuestionImportBatchUpdateData,
    rlsContext?: RLSContext
  ) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (data.batchName !== undefined) updateData.batchName = data.batchName;
    if (data.parsedQuestions !== undefined) updateData.parsedQuestions = data.parsedQuestions;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.metadata !== undefined) updateData.metadata = data.metadata;

    if (data.status === 'imported') {
      updateData.importedAt = new Date().toISOString();
    }

    const [batch] = await db
      .update(questionImportBatches)
      .set(updateData)
      .where(eq(questionImportBatches.id, batchId))
      .returning();

    if (!batch) {
      return null;
    }

    return {
      id: batch.id,
      subject_slug: batch.subjectSlug,
      batch_name: batch.batchName,
      status: batch.status,
      parsed_questions: batch.parsedQuestions,
      metadata: batch.metadata,
      created_by: batch.createdBy,
      created_at: batch.createdAt || null,
      updated_at: batch.updatedAt || null,
      imported_at: batch.importedAt || null,
    };
  }

  /**
   * Get batches for a user
   */
  static async getBatchesByUser(userId: string, options?: { status?: string }, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const conditions = [eq(questionImportBatches.createdBy, userId)];

    if (options?.status) {
      conditions.push(eq(questionImportBatches.status, options.status));
    }

    const batches = await db
      .select()
      .from(questionImportBatches)
      .where(and(...conditions))
      .orderBy(desc(questionImportBatches.createdAt));

    return batches.map((batch) => ({
      id: batch.id,
      subject_slug: batch.subjectSlug,
      batch_name: batch.batchName,
      status: batch.status,
      parsed_questions: batch.parsedQuestions,
      metadata: batch.metadata,
      created_by: batch.createdBy,
      created_at: batch.createdAt || null,
      updated_at: batch.updatedAt || null,
      imported_at: batch.importedAt || null,
    }));
  }
}


