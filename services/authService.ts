import { apiService } from './apiService';
import { demoAuthService } from './demoAuthService';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '../types';

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;
    
    // 1. Early validation for demo accounts
    if (demoAuthService.isDemoAccount(email)) {
      console.log('Demo account detected, trying demo login first');
      try {
        const response = await demoAuthService.tryDemoLogin(email, password);
        console.log('Demo login successful');
        return response;
      } catch (demoError: any) {
        // If it's a session limit error, don't fall back, just throw it
        if (demoError.message.includes('limit reached')) {
          throw demoError;
        }
        // If demo login fails for non-security reasons, we still try backend
        console.warn('Demo login failed, trying backend:', demoError.message);
      }
    }

    // 2. If backend is explicitly disabled, only try demo/mock authentication
    if (!demoAuthService.isBackendActive()) {
      console.log('Backend disabled, trying demo/mock login');
      try {
        return await demoAuthService.tryDemoLogin(email, password);
      } catch (mockError: any) {
        throw new Error(`Backend disabled dan akun "${email}" tidak ditemukan di Mode Demo. Silakan periksa email Anda atau aktifkan backend.`);
      }
    }

    // 3. Try real backend
    try {
      console.log('Attempting backend login');
      const response = await apiService.login(email, password);
      console.log('Backend login successful');
      return response;
    } catch (apiError: any) {
      // 4. Fallback if backend is unreachable
      if (this.isNetworkError(apiError)) {
        console.warn('Backend unreachable, trying demo fallback:', apiError.message);
        try {
          const fallbackResponse = await demoAuthService.tryDemoLogin(email, password);
          console.log('Demo fallback successful');
          return fallbackResponse;
        } catch (fallbackError: any) {
          console.error('Demo fallback failed:', fallbackError.message);
          throw new Error(`Backend tidak terjangkau dan akun "${email}" tidak ditemukan di Mode Demo. Silakan periksa koneksi Anda atau gunakan akun demo yang valid.`);
        }
      }
      
      // If it's not a network error, it's likely invalid credentials
      if (apiError.message?.includes('Invalid credentials') || apiError.message?.includes('401')) {
        // Try demo as last resort
        try {
          console.log('Backend auth failed, trying demo fallback');
          const fallbackResponse = await demoAuthService.tryDemoLogin(email, password);
          console.log('Demo fallback successful after backend failure');
          return fallbackResponse;
        } catch (fallbackError: any) {
          throw new Error(`Login gagal. Backend: ${apiError.message}. Demo: ${fallbackError.message}`);
        }
      }
      
      throw apiError;
    }
  }

  private isNetworkError(error: any): boolean {
    const msg = (error.message || error.toString() || '').toLowerCase();
    const status = error.response?.status;
    
    // Check for network-related errors
    const networkIndicators = [
      'network error',
      'failed to fetch', 
      'network error',
      'econnrefused',
      'timeout',
      'Unable to connect',
      'CORS',
      'ERR_NETWORK',
      'ERR_INTERNET_DISCONNECTED',
      'Network request failed'
    ];
    
    // Check for specific HTTP status codes that indicate network issues
    const networkStatusCodes = [0, 408, 429, 500, 502, 503, 504];
    
    const isNetworkError = networkIndicators.some(indicator => msg.includes(indicator)) ||
                          networkStatusCodes.includes(status) ||
                          error.code === 'NETWORK_ERROR' ||
                          error.name === 'NetworkError';
    
    console.log('Network error detection:', { 
      message: error.message, 
      status, 
      isNetworkError,
      errorType: typeof error,
      errorKeys: Object.keys(error)
    });
    
    return isNetworkError;
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
