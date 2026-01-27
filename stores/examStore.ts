/**
 * Exam Store
 * Global state management for exams and exam-related data
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware/persist';
import type { Exam } from '../types';

interface ExamFilters {
  specialty?: string;
  difficulty?: string;
  mode?: string;
  topic?: string;
  search?: string;
}

interface ExamCache {
  exams: Exam[];
  total: number;
  timestamp: number;
}

interface ExamState {
  // Cached data
  examCache: Record<string, ExamCache>;
  selectedExam: Exam | null;
  filters: ExamFilters;
  isLoading: boolean;

  // Actions
  setExams: (key: string, exams: Exam[], total: number) => void;
  getCachedExams: (key: string, maxAge?: number) => ExamCache | null;
  setSelectedExam: (exam: Exam | null) => void;
  updateExam: (examId: string, updates: Partial<Exam>) => void;
  removeExam: (examId: string) => void;
  setFilters: (filters: Partial<ExamFilters>) => void;
  clearFilters: () => void;
  clearCache: () => void;
  setLoading: (isLoading: boolean) => void;
}

const DEFAULT_CACHE_AGE = 5 * 60 * 1000; // 5 minutes

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      examCache: {},
      selectedExam: null,
      filters: {},
      isLoading: false,

      setExams: (key, exams, total) => {
        set((state) => ({
          examCache: {
            ...state.examCache,
            [key]: {
              exams,
              total,
              timestamp: Date.now()
            }
          }
        }));
      },

      getCachedExams: (key, maxAge = DEFAULT_CACHE_AGE) => {
        const cache = get().examCache[key];
        if (!cache) return null;

        if (Date.now() - cache.timestamp > maxAge) {
          // Cache expired
          set((state) => {
            const newCache = { ...state.examCache };
            delete newCache[key];
            return { examCache: newCache };
          });
          return null;
        }

        return cache;
      },

      setSelectedExam: (exam) => {
        set({ selectedExam: exam });
      },

      updateExam: (examId, updates) => {
        set((state) => {
          const updatedCache = { ...state.examCache };

          // Update in all cache entries
          Object.keys(updatedCache).forEach((key) => {
            const cache = updatedCache[key];
            if (cache) {
              updatedCache[key] = {
                ...cache,
                exams: cache.exams.map((exam) =>
                  exam.id === examId ? { ...exam, ...updates } : exam
                )
              };
            }
          });

          // Update selected exam
          const updatedSelectedExam = state.selectedExam?.id === examId
            ? { ...state.selectedExam, ...updates }
            : state.selectedExam;

          return {
            examCache: updatedCache,
            selectedExam: updatedSelectedExam
          };
        });
      },

      removeExam: (examId) => {
        set((state) => {
          const updatedCache = { ...state.examCache };

          // Remove from all cache entries
          Object.keys(updatedCache).forEach((key) => {
            const cache = updatedCache[key];
            if (cache) {
              updatedCache[key] = {
                ...cache,
                exams: cache.exams.filter((exam) => exam.id !== examId),
                total: Math.max(0, cache.total - 1)
              };
            }
          });

          // Clear selected exam if it's the deleted one
          const updatedSelectedExam = state.selectedExam?.id === examId
            ? null
            : state.selectedExam;

          return {
            examCache: updatedCache,
            selectedExam: updatedSelectedExam
          };
        });
      },

      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters }
        }));
      },

      clearFilters: () => {
        set({ filters: {} });
      },

      clearCache: () => {
        set({ examCache: {} });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      }
    }),
    {
      name: 'sinaesta-exams',
      partialize: (state) => ({
        examCache: state.examCache,
        filters: state.filters
      })
    }
  )
);

// Selectors
export const selectFilters = (state: ExamState) => state.filters;
export const selectSelectedExam = (state: ExamState) => state.selectedExam;
export const selectIsLoading = (state: ExamState) => state.isLoading;
