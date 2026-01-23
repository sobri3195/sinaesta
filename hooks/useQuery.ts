/**
 * useQuery Hook
 * Custom hook for GET requests with caching and automatic refetching
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiError } from '../services/apiClient';

export interface UseQueryOptions<T> {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchInterval?: number;
  cacheTime?: number;
  staleTime?: number;
  retry?: number;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

export interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  isFetching: boolean;
  isSuccess: boolean;
  refetch: () => Promise<void>;
}

const queryCache = new Map<string, { data: any; timestamp: number }>();

export function useQuery<T>(
  queryKey: string | string[],
  queryFn: () => Promise<T>,
  options: UseQueryOptions<T> = {}
): UseQueryResult<T> {
  const {
    enabled = true,
    refetchOnWindowFocus = false,
    refetchInterval,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 0,
    retry = 0,
    retryDelay = 1000,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const key = Array.isArray(queryKey) ? queryKey.join(':') : queryKey;
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef<number>(0);

  const fetchData = useCallback(async () => {
    // Check cache
    const cached = queryCache.get(key);
    if (cached && Date.now() - cached.timestamp < staleTime) {
      setData(cached.data);
      setIsLoading(false);
      setIsError(false);
      setError(null);
      return;
    }

    setIsFetching(true);

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const result = await queryFn();
      
      setData(result);
      setIsError(false);
      setError(null);
      
      // Update cache
      queryCache.set(key, {
        data: result,
        timestamp: Date.now()
      });

      // Cleanup old cache entries
      for (const [cacheKey, cacheValue] of queryCache.entries()) {
        if (Date.now() - cacheValue.timestamp > cacheTime) {
          queryCache.delete(cacheKey);
        }
      }

      if (onSuccess) {
        onSuccess(result);
      }

      retryCountRef.current = 0;
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
      
      // Retry logic
      if (retry > 0 && retryCountRef.current < retry && apiError.isRetryable) {
        retryCountRef.current++;
        setTimeout(() => {
          fetchData();
        }, retryDelay * retryCountRef.current);
        return;
      }

      setIsError(true);
      setError(apiError);

      if (onError) {
        onError(apiError);
      }
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [key, queryFn, staleTime, cacheTime, retry, retryDelay, onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled, fetchData]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (enabled) {
        fetchData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, enabled, fetchData]);

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    const interval = setInterval(() => {
      fetchData();
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [refetchInterval, enabled, fetchData]);

  return {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    isSuccess: !isLoading && !isError && data !== null,
    refetch: fetchData
  };
}

// Helper function to clear query cache
export function clearQueryCache(pattern?: string): void {
  if (!pattern) {
    queryCache.clear();
    return;
  }

  for (const key of queryCache.keys()) {
    if (key.includes(pattern)) {
      queryCache.delete(key);
    }
  }
}
