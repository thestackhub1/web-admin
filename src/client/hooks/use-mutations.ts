// Client-side only — no server secrets or database access here

/**
 * Mutation Hooks
 * 
 * Hooks for create, update, delete operations.
 * These hooks return mutation functions that can be called to perform actions.
 */

import { useState, useCallback } from 'react';
import { api } from '@/client/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export interface UseMutationResult<TData = any, TVariables = any> {
  mutate: (variables: TVariables) => Promise<TData | null>;
  mutateAsync: (variables: TVariables) => Promise<TData | null>;
  isLoading: boolean;
  /** @deprecated Use isLoading instead */
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export function useMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<{ data: TData | null; error: string | null }>,
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: string) => void;
    successMessage?: string;
    errorMessage?: string;
    invalidateQueries?: () => void;
  }
): UseMutationResult<TData, TVariables> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const mutate = useCallback(async (variables: TVariables): Promise<TData | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await mutationFn(variables);
      if (result.error) {
        setError(result.error);
        if (options?.onError) {
          options.onError(result.error);
        } else {
          toast.error(result.error || options?.errorMessage || 'Operation failed');
        }
        return null;
      }
      if (result.data) {
        if (options?.onSuccess) {
          options.onSuccess(result.data);
        }
        if (options?.successMessage) {
          toast.success(options.successMessage);
        }
        if (options?.invalidateQueries) {
          options.invalidateQueries();
        } else {
          router.refresh();
        }
        return result.data;
      }
      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      if (options?.onError) {
        options.onError(message);
      } else {
        toast.error(message || options?.errorMessage || 'Operation failed');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn, options, router]);

  const mutateAsync = mutate;

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  return { mutate, mutateAsync, isLoading, loading: isLoading, error, reset };
}


