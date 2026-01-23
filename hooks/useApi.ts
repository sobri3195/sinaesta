/**
 * useApi Hook
 * Custom hooks for common API operations with typed responses
 */

import { useQuery, UseQueryOptions } from './useQuery';
import { useMutation, UseMutationOptions } from './useMutation';
import {
  authEndpoints,
  userEndpoints,
  examEndpoints,
  resultEndpoints,
  flashcardEndpoints,
  osceEndpoints,
  analyticsEndpoints
} from '../services/endpoints';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  GetExamsRequest,
  CreateExamRequest,
  SubmitExamRequest,
  GetFlashcardsRequest,
  CreateFlashcardRequest,
  UpdateFlashcardRequest,
  GetOSCEStationsRequest,
  SubmitOSCEAttemptRequest,
  GetResultsRequest
} from '../types/api';

// ============================================================================
// Auth Hooks
// ============================================================================

export function useLogin(options?: UseMutationOptions<LoginResponse, LoginRequest>) {
  return useMutation(authEndpoints.login, options);
}

export function useRegister(options?: UseMutationOptions<LoginResponse, RegisterRequest>) {
  return useMutation(authEndpoints.register, options);
}

export function useLogout(options?: UseMutationOptions<void, { refreshToken: string }>) {
  return useMutation(authEndpoints.logout, options);
}

// ============================================================================
// User Hooks
// ============================================================================

export function useCurrentUser(options?: UseQueryOptions<any>) {
  return useQuery('currentUser', userEndpoints.getCurrentUser, options);
}

export function useUser(id: string, options?: UseQueryOptions<any>) {
  return useQuery(['user', id], () => userEndpoints.getUser(id), options);
}

export function useUsers(params?: any, options?: UseQueryOptions<any>) {
  return useQuery(
    ['users', JSON.stringify(params)],
    () => userEndpoints.getUsers(params),
    options
  );
}

export function useUpdateUser(options?: UseMutationOptions<any, { id: string; data: any }>) {
  return useMutation(
    ({ id, data }) => userEndpoints.updateUser(id, data),
    {
      ...options,
      invalidateQueries: ['currentUser', 'users', 'user']
    }
  );
}

// ============================================================================
// Exam Hooks
// ============================================================================

export function useExams(params?: GetExamsRequest, options?: UseQueryOptions<any>) {
  return useQuery(
    ['exams', JSON.stringify(params)],
    () => examEndpoints.getExams(params),
    options
  );
}

export function useExam(id: string, options?: UseQueryOptions<any>) {
  return useQuery(['exam', id], () => examEndpoints.getExam(id), options);
}

export function useCreateExam(options?: UseMutationOptions<any, CreateExamRequest>) {
  return useMutation(examEndpoints.createExam, {
    ...options,
    invalidateQueries: ['exams']
  });
}

export function useUpdateExam(options?: UseMutationOptions<any, { id: string; data: any }>) {
  return useMutation(
    ({ id, data }) => examEndpoints.updateExam(id, data),
    {
      ...options,
      invalidateQueries: ['exams', 'exam']
    }
  );
}

export function useDeleteExam(options?: UseMutationOptions<void, string>) {
  return useMutation(examEndpoints.deleteExam, {
    ...options,
    invalidateQueries: ['exams']
  });
}

export function useSubmitExam(options?: UseMutationOptions<any, { examId: string; data: Omit<SubmitExamRequest, 'examId'> }>) {
  return useMutation(
    ({ examId, data }) => examEndpoints.submitExam(examId, data),
    {
      ...options,
      invalidateQueries: ['results', 'exam']
    }
  );
}

// ============================================================================
// Result Hooks
// ============================================================================

export function useMyResults(params?: GetResultsRequest, options?: UseQueryOptions<any>) {
  return useQuery(
    ['myResults', JSON.stringify(params)],
    () => resultEndpoints.getMyResults(params),
    options
  );
}

export function useResult(id: string, options?: UseQueryOptions<any>) {
  return useQuery(['result', id], () => resultEndpoints.getResult(id), options);
}

export function useAllResults(params?: GetResultsRequest, options?: UseQueryOptions<any>) {
  return useQuery(
    ['allResults', JSON.stringify(params)],
    () => resultEndpoints.getAllResults(params),
    options
  );
}

export function useResultStats(params?: any, options?: UseQueryOptions<any>) {
  return useQuery(
    ['resultStats', JSON.stringify(params)],
    () => resultEndpoints.getResultStats(params),
    options
  );
}

// ============================================================================
// Flashcard Hooks
// ============================================================================

export function useFlashcards(params?: GetFlashcardsRequest, options?: UseQueryOptions<any>) {
  return useQuery(
    ['flashcards', JSON.stringify(params)],
    () => flashcardEndpoints.getFlashcards(params),
    options
  );
}

export function useFlashcard(id: string, options?: UseQueryOptions<any>) {
  return useQuery(['flashcard', id], () => flashcardEndpoints.getFlashcard(id), options);
}

export function useCreateFlashcard(options?: UseMutationOptions<any, CreateFlashcardRequest>) {
  return useMutation(flashcardEndpoints.createFlashcard, {
    ...options,
    invalidateQueries: ['flashcards']
  });
}

export function useUpdateFlashcard(options?: UseMutationOptions<any, { id: string; data: UpdateFlashcardRequest }>) {
  return useMutation(
    ({ id, data }) => flashcardEndpoints.updateFlashcard(id, data),
    {
      ...options,
      invalidateQueries: ['flashcards', 'flashcard']
    }
  );
}

export function useDeleteFlashcard(options?: UseMutationOptions<void, string>) {
  return useMutation(flashcardEndpoints.deleteFlashcard, {
    ...options,
    invalidateQueries: ['flashcards']
  });
}

export function useFlashcardDecks(options?: UseQueryOptions<any>) {
  return useQuery('flashcardDecks', flashcardEndpoints.getFlashcardDecks, options);
}

export function useCreateFlashcardDeck(options?: UseMutationOptions<any, any>) {
  return useMutation(flashcardEndpoints.createFlashcardDeck, {
    ...options,
    invalidateQueries: ['flashcardDecks']
  });
}

// ============================================================================
// OSCE Hooks
// ============================================================================

export function useOSCEStations(params?: GetOSCEStationsRequest, options?: UseQueryOptions<any>) {
  return useQuery(
    ['osceStations', JSON.stringify(params)],
    () => osceEndpoints.getOSCEStations(params),
    options
  );
}

export function useOSCEStation(id: string, options?: UseQueryOptions<any>) {
  return useQuery(['osceStation', id], () => osceEndpoints.getOSCEStation(id), options);
}

export function useCreateOSCEStation(options?: UseMutationOptions<any, any>) {
  return useMutation(osceEndpoints.createOSCEStation, {
    ...options,
    invalidateQueries: ['osceStations']
  });
}

export function useUpdateOSCEStation(options?: UseMutationOptions<any, { id: string; data: any }>) {
  return useMutation(
    ({ id, data }) => osceEndpoints.updateOSCEStation(id, data),
    {
      ...options,
      invalidateQueries: ['osceStations', 'osceStation']
    }
  );
}

export function useDeleteOSCEStation(options?: UseMutationOptions<void, string>) {
  return useMutation(osceEndpoints.deleteOSCEStation, {
    ...options,
    invalidateQueries: ['osceStations']
  });
}

export function useSubmitOSCEAttempt(options?: UseMutationOptions<any, SubmitOSCEAttemptRequest>) {
  return useMutation(osceEndpoints.submitOSCEAttempt, {
    ...options,
    invalidateQueries: ['osceAttempts', 'osceStation']
  });
}

export function useOSCEAttempts(params?: any, options?: UseQueryOptions<any>) {
  return useQuery(
    ['osceAttempts', JSON.stringify(params)],
    () => osceEndpoints.getOSCEAttempts(params),
    options
  );
}

export function useOSCEHistory(userId?: string, options?: UseQueryOptions<any>) {
  return useQuery(
    ['osceHistory', userId],
    () => osceEndpoints.getOSCEHistory(userId),
    options
  );
}

// ============================================================================
// Analytics Hooks
// ============================================================================

export function useUserStats(params?: any, options?: UseQueryOptions<any>) {
  return useQuery(
    ['userStats', JSON.stringify(params)],
    () => analyticsEndpoints.getUserStats(params),
    options
  );
}

export function useExamStats(examId: string, options?: UseQueryOptions<any>) {
  return useQuery(['examStats', examId], () => analyticsEndpoints.getExamStats(examId), options);
}

export function usePerformanceTrends(params?: any, options?: UseQueryOptions<any>) {
  return useQuery(
    ['performanceTrends', JSON.stringify(params)],
    () => analyticsEndpoints.getPerformanceTrends(params),
    options
  );
}
