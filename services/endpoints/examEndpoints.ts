/**
 * Exam API Endpoints
 * Typed API functions for exam management operations
 */

import { apiClient } from '../apiClient';
import {
  GetExamsRequest,
  GetExamsResponse,
  CreateExamRequest,
  CreateExamResponse,
  UpdateExamRequest,
  UpdateExamResponse,
  DeleteExamRequest,
  SubmitExamRequest,
  SubmitExamResponse
} from '../../types/api';

export const examEndpoints = {
  /**
   * Get exams list
   * @param params - Filter and pagination params
   * @returns Paginated list of exams
   */
  async getExams(params?: GetExamsRequest): Promise<GetExamsResponse> {
    return apiClient.get('/exams', { params });
  },

  /**
   * Get single exam by ID
   * @param id - Exam ID
   * @returns Exam data
   */
  async getExam(id: string): Promise<any> {
    return apiClient.get(`/exams/${id}`);
  },

  /**
   * Create new exam
   * @param data - Exam data
   * @returns Created exam
   */
  async createExam(data: CreateExamRequest): Promise<CreateExamResponse> {
    return apiClient.post('/exams', data);
  },

  /**
   * Update existing exam
   * @param id - Exam ID
   * @param data - Updated exam data
   * @returns Updated exam
   */
  async updateExam(id: string, data: UpdateExamRequest): Promise<UpdateExamResponse> {
    return apiClient.put(`/exams/${id}`, data);
  },

  /**
   * Delete exam
   * @param id - Exam ID
   */
  async deleteExam(id: string): Promise<void> {
    await apiClient.delete(`/exams/${id}`);
  },

  /**
   * Submit exam answers
   * @param examId - Exam ID
   * @param data - Submission data
   * @returns Exam result
   */
  async submitExam(examId: string, data: Omit<SubmitExamRequest, 'examId'>): Promise<SubmitExamResponse> {
    return apiClient.post(`/exams/${examId}/submit`, data);
  },

  /**
   * Get exam results
   * @param examId - Exam ID
   * @param userId - Optional user ID filter
   * @returns Exam results
   */
  async getExamResults(examId: string, userId?: string): Promise<any> {
    return apiClient.get(`/exams/${examId}/results`, { params: userId ? { userId } : undefined });
  }
};
