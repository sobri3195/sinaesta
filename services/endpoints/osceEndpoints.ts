/**
 * OSCE API Endpoints
 * Typed API functions for OSCE station and attempt operations
 */

import { apiClient } from '../apiClient';
import {
  GetOSCEStationsRequest,
  GetOSCEStationsResponse,
  CreateOSCEStationRequest,
  UpdateOSCEStationRequest,
  GetOSCEAttemptsRequest,
  SubmitOSCEAttemptRequest,
  SubmitOSCEAttemptResponse
} from '../../types/api';

export const osceEndpoints = {
  /**
   * Get OSCE stations list
   * @param params - Filter and pagination params
   * @returns Paginated list of OSCE stations
   */
  async getOSCEStations(params?: GetOSCEStationsRequest): Promise<GetOSCEStationsResponse> {
    return apiClient.get('/osce/stations', { params });
  },

  /**
   * Get single OSCE station by ID
   * @param id - Station ID
   * @returns OSCE station data
   */
  async getOSCEStation(id: string): Promise<any> {
    return apiClient.get(`/osce/stations/${id}`);
  },

  /**
   * Create new OSCE station
   * @param data - OSCE station data
   * @returns Created OSCE station
   */
  async createOSCEStation(data: CreateOSCEStationRequest): Promise<any> {
    return apiClient.post('/osce/stations', data);
  },

  /**
   * Update existing OSCE station
   * @param id - Station ID
   * @param data - Updated OSCE station data
   * @returns Updated OSCE station
   */
  async updateOSCEStation(id: string, data: UpdateOSCEStationRequest): Promise<any> {
    return apiClient.put(`/osce/stations/${id}`, data);
  },

  /**
   * Delete OSCE station
   * @param id - Station ID
   */
  async deleteOSCEStation(id: string): Promise<void> {
    await apiClient.delete(`/osce/stations/${id}`);
  },

  /**
   * Get OSCE attempts
   * @param params - Filter and pagination params
   * @returns Paginated list of OSCE attempts
   */
  async getOSCEAttempts(params?: GetOSCEAttemptsRequest): Promise<any> {
    return apiClient.get('/osce/attempts', { params });
  },

  /**
   * Get single OSCE attempt by ID
   * @param id - Attempt ID
   * @returns OSCE attempt data
   */
  async getOSCEAttempt(id: string): Promise<any> {
    return apiClient.get(`/osce/attempts/${id}`);
  },

  /**
   * Submit OSCE attempt
   * @param data - Attempt data
   * @returns Attempt result
   */
  async submitOSCEAttempt(data: SubmitOSCEAttemptRequest): Promise<SubmitOSCEAttemptResponse> {
    return apiClient.post('/osce/attempts', data);
  },

  /**
   * Update OSCE attempt (feedback/grading)
   * @param id - Attempt ID
   * @param data - Updated attempt data
   * @returns Updated attempt
   */
  async updateOSCEAttempt(id: string, data: { feedback?: string; score?: number }): Promise<any> {
    return apiClient.put(`/osce/attempts/${id}`, data);
  },

  /**
   * Get OSCE history for user
   * @param userId - Optional user ID (defaults to current user)
   * @returns List of OSCE attempts
   */
  async getOSCEHistory(userId?: string): Promise<any> {
    return apiClient.get('/osce/attempts', { params: userId ? { userId } : undefined });
  }
};
