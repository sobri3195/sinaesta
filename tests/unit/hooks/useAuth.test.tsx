import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../../context/AuthContext';
import { authService } from '../../../services/authService';
import { createMockUser, mockLoginResponse } from '../../utils/mockData';
import { User, LoginCredentials, RegisterCredentials } from '../../../types';

// Mock the auth service
vi.mock('../../../services/authService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getStoredUser: vi.fn(),
    setAuthData: vi.fn(),
    clearAuthData: vi.fn(),
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

describe('useAuth', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should provide initial authentication state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(true);
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.register).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.updateUser).toBe('function');
  });

  it('should initialize with stored user if available', async () => {
    const mockUser = createMockUser();
    vi.mocked(authService.getStoredUser).mockReturnValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for initialization
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle login successfully', async () => {
    const loginCredentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    vi.mocked(authService.login).mockResolvedValue(mockLoginResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login(loginCredentials);
    });

    expect(authService.login).toHaveBeenCalledWith(loginCredentials);
    expect(authService.setAuthData).toHaveBeenCalledWith(mockLoginResponse);
    expect(result.current.user).toEqual(mockLoginResponse.user);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle login failure', async () => {
    const loginCredentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'wrongpassword'
    };

    const loginError = new Error('Invalid credentials');
    vi.mocked(authService.login).mockRejectedValue(loginError);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(result.current.login(loginCredentials)).rejects.toThrow('Invalid credentials');

    expect(authService.login).toHaveBeenCalledWith(loginCredentials);
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle registration successfully', async () => {
    const registerCredentials: RegisterCredentials = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
      role: 'STUDENT'
    };

    vi.mocked(authService.register).mockResolvedValue(mockLoginResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register(registerCredentials);
    });

    expect(authService.register).toHaveBeenCalledWith(registerCredentials);
    expect(authService.setAuthData).toHaveBeenCalledWith(mockLoginResponse);
    expect(result.current.user).toEqual(mockLoginResponse.user);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle logout successfully', async () => {
    vi.mocked(authService.logout).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(authService.logout).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle logout error gracefully', async () => {
    const logoutError = new Error('Logout failed');
    vi.mocked(authService.logout).mockRejectedValue(logoutError);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Should not throw error during logout
    await act(async () => {
      await result.current.logout();
    });

    expect(authService.logout).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should update user data', () => {
    const updatedUser = createMockUser({ name: 'Updated Name' });
    
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.updateUser(updatedUser);
    });

    expect(result.current.user).toEqual(updatedUser);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(updatedUser));
  });

  it('should handle authentication initialization error', () => {
    const initError = new Error('Initialization failed');
    vi.mocked(authService.getStoredUser).mockImplementation(() => {
      throw initError;
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Should handle error and set loading to false
    expect(result.current.isLoading).toBe(true);
    
    // Wait for initialization to complete
    act(() => {
      // The error should be caught and auth data should be cleared
    });

    expect(authService.clearAuthData).toHaveBeenCalled();
  });

  it('should throw error when used outside AuthProvider', () => {
    // Suppress console error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });
});