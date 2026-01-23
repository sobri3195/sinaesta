/**
 * Analytics API Endpoints
 * Typed API functions for analytics and statistics operations
 */

import { apiClient } from '../apiClient';
import {
  GetUserStatsRequest,
  GetUserStatsResponse,
  GetExamStatsRequest,
  GetExamStatsResponse,
  GetPerformanceTrendsRequest,
  GetPerformanceTrendsResponse
} from '../../types/api';

export const analyticsEndpoints = {
  /**
   * Get user statistics
   * @param params - User stats request params
   * @returns User statistics
   */
  async getUserStats(params?: GetUserStatsRequest): Promise<GetUserStatsResponse> {
    return apiClient.get('/analytics/user-stats', { params });
  },

  /**
   * Get exam statistics
   * @param examId - Exam ID
   * @returns Exam statistics
   */
  async getExamStats(examId: string): Promise<GetExamStatsResponse> {
    return apiClient.get(`/analytics/exam-stats/${examId}`);
  },

  /**
   * Get performance trends
   * @param params - Performance trends request params
   * @returns Performance trends
   */
  async getPerformanceTrends(params?: GetPerformanceTrendsRequest): Promise<GetPerformanceTrendsResponse> {
    return apiClient.get('/analytics/performance-trends', { params });
  }
};
