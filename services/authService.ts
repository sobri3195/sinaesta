import { apiService } from './apiService';
import { AuthResponse, LoginCredentials, RegisterCredentials, UserRole, UserStatus } from '../types';

export const DEMO_CREDENTIALS = {
  email: 'demo@sinaesta.com',
  password: 'demo123',
};

const createDemoAuthResponse = (): AuthResponse => ({
  user: {
    id: 'demo-user',
    email: DEMO_CREDENTIALS.email,
    name: 'Akun Demo',
    role: UserRole.STUDENT,
    avatar: 'https://ui-avatars.com/api/?name=Akun+Demo&background=4F46E5&color=fff',
    status: UserStatus.VERIFIED,
    targetSpecialty: 'Internal Medicine',
    emailVerified: true,
  },
  accessToken: 'demo-access-token',
  refreshToken: 'demo-refresh-token',
});

const isDemoCredentials = (credentials: LoginCredentials) =>
  credentials.email.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
  credentials.password === DEMO_CREDENTIALS.password;

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (isDemoCredentials(credentials)) {
      return createDemoAuthResponse();
    }
    const response = await apiService.login(credentials.email, credentials.password);
    return response;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiService.register(credentials);
    return response;
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
