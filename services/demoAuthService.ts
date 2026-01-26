// Demo Authentication Service - Bypass backend for demo accounts
import { AuthResponse, User, UserRole } from '../types';
import { authService } from './authService';

// Demo account credentials (matching seed.sql)
const DEMO_ACCOUNTS = {
  'demo@sinaesta.com': {
    password: 'demo123',
    user: {
      id: 'demo-user-id',
      name: 'Demo User',
      email: 'demo@sinaesta.com',
      role: UserRole.STUDENT as const,
      status: 'VERIFIED',
      targetSpecialty: 'Internal Medicine',
      institution: 'Sinaesta Demo',
      avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=0D8ABC&color=fff',
    },
  },
  'student1@sinaesta.com': {
    password: 'admin123',
    user: {
      id: 'student1-id',
      name: 'John Doe',
      email: 'student1@sinaesta.com',
      role: UserRole.STUDENT as const,
      status: 'VERIFIED',
      targetSpecialty: 'Internal Medicine',
      institution: 'Medical University',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff',
    },
  },
  'mentor1@sinaesta.com': {
    password: 'admin123',
    user: {
      id: 'mentor1-id',
      name: 'Dr. Sarah Johnson',
      email: 'mentor1@sinaesta.com',
      role: UserRole.TEACHER as const,
      status: 'VERIFIED',
      targetSpecialty: 'Internal Medicine',
      institution: 'Medical University',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=22C55E&color=fff',
    },
  },
  'admin@sinaesta.com': {
    password: 'admin123',
    user: {
      id: 'admin-id',
      name: 'System Administrator',
      email: 'admin@sinaesta.com',
      role: UserRole.SUPER_ADMIN as const,
      status: 'VERIFIED',
      targetSpecialty: 'Internal Medicine',
      institution: 'Sinaesta Admin',
      avatar: 'https://ui-avatars.com/api/?name=Admin&background=7C3AED&color=fff',
    },
  },
};

class DemoAuthService {
  private isBackendEnabled: boolean = true;

  constructor() {
    // Check if backend should be disabled (for demo mode)
    this.isBackendEnabled = localStorage.getItem('backendEnabled') !== 'false';
  }

  // Enable/disable backend communication
  setBackendEnabled(enabled: boolean): void {
    this.isBackendEnabled = enabled;
    localStorage.setItem('backendEnabled', enabled.toString());
  }

  isBackendActive(): boolean {
    return this.isBackendEnabled;
  }

  // Check if email is a demo account
  isDemoAccount(email: string): boolean {
    return email in DEMO_ACCOUNTS;
  }

  // Authenticate demo account without backend
  async loginDemoAccount(email: string, password: string): Promise<AuthResponse> {
    const account = DEMO_ACCOUNTS[email];
    
    if (!account) {
      throw new Error('Demo account not found');
    }

    if (account.password !== password) {
      throw new Error('Invalid credentials for demo account');
    }

    // Generate mock tokens
    const accessToken = this.generateMockToken(account.user);
    const refreshToken = this.generateMockToken(account.user, 'refresh');

    return {
      accessToken,
      refreshToken,
      user: account.user,
    };
  }

  // Try demo login first, fall back to real backend
  async tryDemoLogin(email: string, password: string): Promise<AuthResponse> {
    // If backend is disabled, force demo login
    if (!this.isBackendEnabled) {
      return this.loginDemoAccount(email, password);
    }

    // If this is a demo account, try demo login first
    if (this.isDemoAccount(email)) {
      try {
        return await this.loginDemoAccount(email, password);
      } catch (demoError) {
        // Fall back to real backend if demo login fails
        console.warn('Demo login failed, trying real backend:', demoError);
        return await authService.login({ email, password, rememberMe: false });
      }
    }

    // For non-demo accounts, use real backend
    return await authService.login({ email, password, rememberMe: false });
  }

  private generateMockToken(user: User, type: 'access' | 'refresh' = 'access'): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (type === 'access' ? 3600 : 86400), // 1h vs 24h
    };

    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = 'mock-signature-for-demo-mode';

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  // Mock backend responses for demo mode
  async mockBackendRequest(endpoint: string, method: string = 'GET', data?: any): Promise<any> {
    if (this.isBackendEnabled) {
      throw new Error('Backend is enabled, use real API calls');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock responses for common endpoints
    switch (endpoint) {
      case '/auth/login':
        if (method === 'POST' && data?.email && data?.password) {
          return this.tryDemoLogin(data.email, data.password);
        }
        break;

      case '/users/me':
        if (method === 'GET') {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            return { data: JSON.parse(userStr) };
          }
        }
        break;

      case '/exams':
        if (method === 'GET') {
          return {
            data: [
              {
                id: 'exam-1',
                title: 'Sample Exam',
                description: 'Demo exam for testing',
                questions: [],
              },
            ],
          };
        }
        break;

      default:
        console.warn(`Mock endpoint not implemented: ${method} ${endpoint}`);
        return { data: {} };
    }

    throw new Error('Mock endpoint not found');
  }
}

export const demoAuthService = new DemoAuthService();