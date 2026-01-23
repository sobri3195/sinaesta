/**
 * Results API Endpoints
 * Typed API functions for exam results operations
 */

import { apiClient } from '../apiClient';
import {
  GetResultsRequest,
  GetResultsResponse,
  GetResultDetailsRequest,
  GetResultStatsRequest,
  GetResultStatsResponse
} from '../../types/api';

export const resultEndpoints = {
  /**
   * Get user's results
   * @param params - Filter and pagination params
   * @returns Paginated list of results
   */
  async getMyResults(params?: GetResultsRequest): Promise<GetResultsResponse> {
    return apiClient.get('/results/my-results', { params });
  },

  /**
   * Get single result by ID
   * @param id - Result ID
   * @returns Result details
   */
  async getResult(id: string): Promise<any> {
    return apiClient.get(`/results/${id}`);
  },

  /**
   * Get all results (admin only)
   * @param params - Filter and pagination params
   * @returns Paginated list of results
   */
  async getAllResults(params?: GetResultsRequest): Promise<GetResultsResponse> {
    return apiClient.get('/results', { params });
  },

  /**
   * Get result statistics
   * @param params - Filter params
   * @returns Result statistics
   */
  async getResultStats(params?: GetResultStatsRequest): Promise<GetResultStatsResponse> {
    return apiClient.get('/results/stats/overview', { params });
  }
};
