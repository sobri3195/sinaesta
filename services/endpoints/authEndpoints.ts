/**
 * Authentication API Endpoints
 * Typed API functions for authentication operations
 */

import { apiClient } from '../apiClient';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
  VerifyEmailRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from '../../types/api';

export const authEndpoints = {
  /**
   * User login
   * @param credentials - Email and password
   * @returns User data and tokens
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<{ data: LoginResponse }>('/auth/login', credentials);
    return response.data;
  },

  /**
   * User registration
   * @param data - Registration information
   * @returns User data and tokens
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<{ data: RegisterResponse }>('/auth/register', data);
    return response.data;
  },

  /**
   * User logout
   * @param data - Refresh token
   */
  async logout(data: LogoutRequest): Promise<void> {
    await apiClient.post('/auth/logout', data);
  },

  /**
   * Refresh access token
   * @param data - Refresh token
   * @returns New access token and optional refresh token
   */
  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<{ data: RefreshTokenResponse }>('/auth/refresh', data);
    return response.data;
  },

  /**
   * Verify email address
   * @param data - Verification token
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<void> {
    await apiClient.post('/auth/verify-email', data);
  },

  /**
   * Request password reset
   * @param data - User email
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await apiClient.post('/auth/forgot-password', data);
  },

  /**
   * Reset password with token
   * @param data - Reset token and new password
   */
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await apiClient.post('/auth/reset-password', data);
  }
};
