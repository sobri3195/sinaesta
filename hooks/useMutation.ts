/**
 * useMutation Hook
 * Custom hook for POST/PUT/DELETE operations with optimistic updates
 */

import { useState, useCallback } from 'react';
import { ApiError } from '../services/apiClient';
import { clearQueryCache } from './useQuery';

export interface UseMutationOptions<TData, TVariables> {
  onMutate?: (variables: TVariables) => Promise<any> | any;
  onSuccess?: (data: TData, variables: TVariables, context: any) => void;
  onError?: (error: ApiError, variables: TVariables, context: any) => void;
  onSettled?: (data: TData | undefined, error: ApiError | null, variables: TVariables, context: any) => void;
  retry?: number;
  retryDelay?: number;
  invalidateQueries?: string[];
  optimisticUpdate?: boolean;
}

export interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  data: TData | null;
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  isSuccess: boolean;
  reset: () => void;
}

export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables> = {}
): UseMutationResult<TData, TVariables> {
  const {
    onMutate,
    onSuccess,
    onError,
    onSettled,
    retry = 0,
    retryDelay = 1000,
    invalidateQueries = [],
    optimisticUpdate = false
  } = options;

  const [data, setData] = useState<TData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const executeMutation = useCallback(async (variables: TVariables): Promise<TData> => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    setIsSuccess(false);

    let context: any;

    try {
      // Optimistic update
      if (optimisticUpdate && onMutate) {
        context = await onMutate(variables);
      }

      const result = await mutationFn(variables);
      
      setData(result);
      setIsSuccess(true);

      // Invalidate related queries
      invalidateQueries.forEach((query) => {
        clearQueryCache(query);
      });

      if (onSuccess) {
        onSuccess(result, variables, context);
      }

      if (onSettled) {
        onSettled(result, null, variables, context);
      }

      return result;
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );

      // Retry logic
      if (retry > 0 && apiError.isRetryable) {
        for (let attempt = 0; attempt < retry; attempt++) {
          try {
            await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
            const result = await mutationFn(variables);
            setData(result);
            setIsSuccess(true);
            setIsLoading(false);
            return result;
          } catch {
            // Continue retrying
          }
        }
      }

      setIsError(true);
      setError(apiError);

      if (onError) {
        onError(apiError, variables, context);
      }

      if (onSettled) {
        onSettled(undefined, apiError, variables, context);
      }

      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn, optimisticUpdate, onMutate, onSuccess, onError, onSettled, retry, retryDelay, invalidateQueries]);

  const reset = useCallback(() => {
    setData(null);
    setIsLoading(false);
    setIsError(false);
    setError(null);
    setIsSuccess(false);
  }, []);

  return {
    mutate: executeMutation,
    mutateAsync: executeMutation,
    data,
    isLoading,
    isError,
    error,
    isSuccess,
    reset
  };
}
