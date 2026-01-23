import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from '../../../services/authService';
import { apiService } from '../../../services/apiService';
import { createMockUser, mockLoginResponse } from '../../utils/mockData';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '../../../types';

// Mock the API service
vi.mock('../../../services/apiService', () => ({
  apiService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock fetch
global.fetch = vi.fn();

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear all localStorage mock calls
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      vi.mocked(apiService.login).mockResolvedValue(mockLoginResponse);

      const result = await authService.login(credentials);

      expect(result).toEqual(mockLoginResponse);
      expect(apiService.login).toHaveBeenCalledWith(credentials.email, credentials.password);
    });

    it('should handle login failure', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const loginError = new Error('Invalid credentials');
      vi.mocked(apiService.login).mockRejectedValue(loginError);

      await expect(authService.login(credentials)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const credentials: RegisterCredentials = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        role: 'STUDENT'
      };

      vi.mocked(apiService.register).mockResolvedValue(mockLoginResponse);

      const result = await authService.register(credentials);

      expect(result).toEqual(mockLoginResponse);
      expect(apiService.register).toHaveBeenCalledWith(credentials);
    });

    it('should handle registration failure', async () => {
      const credentials: RegisterCredentials = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
        role: 'STUDENT'
      };

      const registerError = new Error('User already exists');
      vi.mocked(apiService.register).mockRejectedValue(registerError);

      await expect(authService.register(credentials)).rejects.toThrow('User already exists');
    });
  });

  describe('logout', () => {
    it('should logout with refresh token', async () => {
      const mockRefreshToken = 'mock-refresh-token';
      localStorageMock.getItem.mockReturnValue(mockRefreshToken);
      vi.mocked(apiService.logout).mockResolvedValue(undefined);

      await authService.logout();

      expect(apiService.logout).toHaveBeenCalledWith(mockRefreshToken);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });

    it('should logout without refresh token', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      vi.mocked(apiService.logout).mockResolvedValue(undefined);

      await authService.logout();

      expect(apiService.logout).not.toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockRefreshToken = 'mock-refresh-token';
      localStorageMock.getItem.mockReturnValue(mockRefreshToken);
      vi.mocked(apiService.refreshToken).mockResolvedValue(mockLoginResponse);

      const result = await authService.refreshToken();

      expect(result).toEqual(mockLoginResponse);
      expect(apiService.refreshToken).toHaveBeenCalledWith(mockRefreshToken);
    });

    it('should throw error when no refresh token', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      await expect(authService.refreshToken()).rejects.toThrow('No refresh token');
    });

    it('should handle refresh token failure', async () => {
      const mockRefreshToken = 'invalid-refresh-token';
      localStorageMock.getItem.mockReturnValue(mockRefreshToken);
      const refreshError = new Error('Invalid refresh token');
      vi.mocked(apiService.refreshToken).mockRejectedValue(refreshError);

      await expect(authService.refreshToken()).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('setAuthData', () => {
    it('should set auth data with refresh token', () => {
      const authResponse: AuthResponse = {
        ...mockLoginResponse,
        refreshToken: 'new-refresh-token'
      };

      authService.setAuthData(authResponse);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', authResponse.accessToken);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', authResponse.refreshToken);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(authResponse.user));
    });

    it('should set auth data without refresh token', () => {
      const authResponse: AuthResponse = {
        user: mockLoginResponse.user,
        accessToken: 'access-token'
      };

      authService.setAuthData(authResponse);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'access-token');
      expect(localStorageMock.setItem).not.toHaveBeenCalledWith('refreshToken', expect.any(String));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(authResponse.user));
    });
  });

  describe('clearAuthData', () => {
    it('should clear all auth data', () => {
      authService.clearAuthData();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('getStoredUser', () => {
    it('should return stored user', () => {
      const mockUser = createMockUser();
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));

      const result = authService.getStoredUser();

      expect(result).toEqual(mockUser);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
    });

    it('should return null when no stored user', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = authService.getStoredUser();

      expect(result).toBeNull();
      expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
    });

    it('should return null when stored data is invalid', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');

      // Mock JSON.parse to throw an error for invalid JSON
      const originalParse = JSON.parse;
      JSON.parse = vi.fn().mockImplementation(() => {
        throw new SyntaxError('Unexpected token i in JSON at position 0');
      });

      const result = authService.getStoredUser();

      expect(result).toBeNull();
      expect(localStorageMock.getItem).toHaveBeenCalledWith('user');

      // Restore original JSON.parse
      JSON.parse = originalParse;
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const mockResponse = { success: true };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const token = 'verification-token';

      await authService.verifyEmail(token);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/verify-email'),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        }
      );
    });

    it('should throw error when email verification fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Invalid token' })
      });

      const token = 'invalid-token';

      await expect(authService.verifyEmail(token)).rejects.toThrow('Invalid token');
    });
  });

  describe('forgotPassword', () => {
    it('should request password reset successfully', async () => {
      const mockResponse = { success: true };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const email = 'test@example.com';

      await authService.forgotPassword(email);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/forgot-password'),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        }
      );
    });

    it('should throw error when password reset request fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Email not found' })
      });

      const email = 'nonexistent@example.com';

      await expect(authService.forgotPassword(email)).rejects.toThrow('Email not found');
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const mockResponse = { success: true };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const token = 'reset-token';
      const newPassword = 'newpassword123';

      await authService.resetPassword(token, newPassword);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/reset-password'),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password: newPassword })
        }
      );
    });

    it('should throw error when password reset fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Invalid or expired token' })
      });

      const token = 'invalid-token';
      const newPassword = 'newpassword123';

      await expect(authService.resetPassword(token, newPassword)).rejects.toThrow('Invalid or expired token');
    });
  });
});