import { apiService } from './apiService';
import { demoAuthService } from './demoAuthService';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '../types';

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // 1. If backend is explicitly disabled, only try demo/mock authentication
    if (!demoAuthService.isBackendActive()) {
      return await demoAuthService.tryDemoLogin(credentials.email, credentials.password);
    }

    // 2. If it's a known demo account, try demo login first
    if (demoAuthService.isDemoAccount(credentials.email)) {
      try {
        return await demoAuthService.tryDemoLogin(credentials.email, credentials.password);
      } catch (demoError: any) {
        // If it's a session limit error, don't fall back, just throw it
        if (demoError.message.includes('limit reached')) {
          throw demoError;
        }
        // Otherwise, fall through to try real backend
        console.warn('Demo login failed, trying real backend');
      }
    }

    // 3. Try real backend
    try {
      const response = await apiService.login(credentials.email, credentials.password);
      return response;
    } catch (apiError: any) {
      // 4. Fallback if backend is unreachable
      if (this.isNetworkError(apiError)) {
        console.warn('Backend unreachable, trying mock/demo fallback');
        try {
          return await demoAuthService.tryDemoLogin(credentials.email, credentials.password);
        } catch (fallbackError) {
          throw new Error('Backend tidak terjangkau dan akun tidak ditemukan di Mode Demo. Silakan periksa koneksi Anda atau gunakan akun demo.');
        }
      }
      throw apiError;
    }
  }

  private isNetworkError(error: any): boolean {
    const msg = error.message || '';
    return msg.includes('Network Error') || 
           msg.includes('Failed to fetch') || 
           msg.includes('Network error') ||
           msg.includes('ECONNREFUSED');
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      // If backend is disabled, use mock registration
      if (!demoAuthService.isBackendActive()) {
        return await demoAuthService.register(credentials);
      }
      
      const response = await apiService.register(credentials);
      return response;
    } catch (error: any) {
      // If backend is unreachable, fall back to mock registration
      if (this.isNetworkError(error)) {
        console.warn('Backend unreachable during registration, falling back to mock registration');
        return await demoAuthService.register(credentials);
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await apiService.logout(refreshToken);
    }
    this.clearAuthData();
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token');
    }
    const response = await apiService.refreshToken(refreshToken);
    return response;
  }

  async verifyEmail(token: string): Promise<void> {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Email verification failed');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to request password reset');
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Password reset failed');
    }
  }

  setAuthData(authResponse: AuthResponse): void {
    localStorage.setItem('accessToken', authResponse.accessToken);
    if (authResponse.refreshToken) {
      localStorage.setItem('refreshToken', authResponse.refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(authResponse.user));
  }

  clearAuthData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  getStoredUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
