/**
 * User API Endpoints
 * Typed API functions for user management operations
 */

import { apiClient } from '../apiClient';
import {
  GetUsersRequest,
  GetUsersResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  DeleteUserRequest
} from '../../types/api';

export const userEndpoints = {
  /**
   * Get current user profile
   * @returns Current user data
   */
  async getCurrentUser(): Promise<any> {
    return apiClient.get('/users/me');
  },

  /**
   * Get user by ID
   * @param id - User ID
   * @returns User data
   */
  async getUser(id: string): Promise<any> {
    return apiClient.get(`/users/${id}`);
  },

  /**
   * Get all users (admin only)
   * @param params - Filter and pagination params
   * @returns Paginated list of users
   */
  async getUsers(params?: GetUsersRequest): Promise<GetUsersResponse> {
    return apiClient.get('/users', { params });
  },

  /**
   * Update user profile
   * @param id - User ID
   * @param data - Updated user data
   * @returns Updated user data
   */
  async updateUser(id: string, data: UpdateUserRequest): Promise<UpdateUserResponse> {
    return apiClient.put(`/users/${id}`, data);
  },

  /**
   * Delete user account
   * @param id - User ID
   */
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  }
};
