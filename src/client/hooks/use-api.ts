// Client-side only — no server secrets or database access here

/**
 * Generic API Hook
 * 
 * Simple hook for making API calls with loading and error states.
 * Uses the api client from @/client/api.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '@/client/api';

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: () => Promise<T | null>;
  reset: () => void;
}

export function useApi<T>(
  apiCall: () => Promise<{ data: T | null; error: string | null }>,
  autoExecute: boolean = false
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(autoExecute);
  const [error, setError] = useState<string | null>(null);
  const apiCallRef = useRef(apiCall);

  // Update ref when apiCall changes
  useEffect(() => {
    apiCallRef.current = apiCall;
  }, [apiCall]);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCallRef.current();
      if (result.error) {
        setError(result.error);
        setData(null);
        return null;
      }
      setData(result.data);
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (autoExecute) {
      execute();
    }
  }, [autoExecute, execute]);

  return { data, loading, error, execute, reset };
}

