// Client-side only — no server secrets or database access here

/**
 * Question Import Hooks
 * 
 * Hooks for handling question import operations (PDF/CSV parsing and committing).
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getAccessToken } from '@/lib/auth/client';
import type { ParsedQuestion } from '@/lib/pdf/pdf-parser';

// ============================================================
// Types
// ============================================================

export interface ImportPdfOptions {
  subjectSlug: string;
  batchName: string;
  pdfFile: File;
  answerKeyFile?: File;
  useAI: boolean;
  aiModel?: string;
  scholarshipMode?: boolean;
}

export interface ImportCsvOptions {
  subjectSlug: string;
  batchName: string;
  csvFile: File;
}

export interface ImportResult {
  batchId: string;
  questions: ParsedQuestion[];
  questionsCount: number;
}

export interface SaveDraftOptions {
  batchId: string;
  questions: ParsedQuestion[];
  batchName?: string;
}

export interface CommitImportOptions {
  batchId: string;
  defaultChapterId?: string;
  defaultClassLevel?: string;
  defaultDifficulty: string;
  defaultMarks: number;
}

export interface CommitResult {
  importedCount: number;
}

// ============================================================
// Hooks
// ============================================================

/**
 * Hook for importing questions from PDF
 */
export function useImportPdf() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const importPdf = useCallback(async (options: ImportPdfOptions): Promise<ImportResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('subjectSlug', options.subjectSlug);
      formData.append('batchName', options.batchName);
      formData.append('pdf', options.pdfFile);
      formData.append('useAI', options.useAI.toString());
      
      if (options.useAI && options.aiModel) {
        formData.append('aiModel', options.aiModel);
      }
      
      if (options.useAI && options.scholarshipMode !== undefined) {
        formData.append('scholarshipMode', options.scholarshipMode.toString());
      }
      
      if (options.answerKeyFile) {
        formData.append('answerKey', options.answerKeyFile);
      }

      const token = await getAccessToken();
      
      const response = await fetch('/api/v1/questions/import/pdf', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
        body: formData,
      });

      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        toast.error('Session expired. Please log in again.');
        router.push('/login');
        return null;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process PDF');
      }

      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to import PDF';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [router]);

  return { importPdf, loading, error };
}

/**
 * Hook for importing questions from CSV
 */
export function useImportCsv() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const importCsv = useCallback(async (options: ImportCsvOptions): Promise<ImportResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('subjectSlug', options.subjectSlug);
      formData.append('batchName', options.batchName);
      formData.append('file', options.csvFile);

      const token = await getAccessToken();
      
      const response = await fetch('/api/v1/questions/import/csv', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
        body: formData,
      });

      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        toast.error('Session expired. Please log in again.');
        router.push('/login');
        return null;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process CSV');
      }

      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to import CSV';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [router]);

  return { importCsv, loading, error };
}

/**
 * Hook for saving import draft
 */
export function useSaveImportDraft() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const saveDraft = useCallback(async (options: SaveDraftOptions): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const token = await getAccessToken();
      
      const response = await fetch('/api/v1/questions/import/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          batchId: options.batchId,
          questions: options.questions,
          batchName: options.batchName,
        }),
      });

      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        toast.error('Session expired. Please log in again.');
        router.push('/login');
        return false;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save draft');
      }

      toast.success('Draft saved successfully');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save draft';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [router]);

  return { saveDraft, loading, error };
}

/**
 * Hook for committing import to database
 */
export function useCommitImport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const commit = useCallback(async (
    options: CommitImportOptions,
    subjectSlug: string
  ): Promise<CommitResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const token = await getAccessToken();
      
      const response = await fetch('/api/v1/questions/import/commit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          batchId: options.batchId,
          defaultChapterId: options.defaultChapterId || null,
          defaultClassLevel: options.defaultClassLevel || 'class_10',
          defaultDifficulty: options.defaultDifficulty,
          defaultMarks: options.defaultMarks,
        }),
      });

      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        toast.error('Session expired. Please log in again.');
        router.push('/login');
        return null;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to import questions');
      }

      toast.success(`Successfully imported ${data.data.importedCount} questions`);
      
      // Navigate to questions page
      router.push(`/dashboard/questions/${subjectSlug}`);
      router.refresh();

      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to commit import';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [router]);

  return { commit, loading, error };
}
