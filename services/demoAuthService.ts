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
    restrictions: {
      allowedRoles: [UserRole.STUDENT],
      maxSessionDuration: 30 * 60 * 1000, // 30 minutes
      allowedFeatures: ['EXAM_TAKING', 'FLASHCARDS', 'MICROLEARNING', 'SPOT_DX_DRILL']
    }
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
    restrictions: {
      allowedRoles: [UserRole.STUDENT],
      maxSessionDuration: 60 * 60 * 1000, // 1 hour
      allowedFeatures: ['EXAM_TAKING', 'FLASHCARDS', 'MICROLEARNING', 'OSCE_PRACTICE', 'SPOT_DX_DRILL']
    }
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
    restrictions: {
      allowedRoles: [UserRole.TEACHER],
      maxSessionDuration: 120 * 60 * 1000, // 2 hours
      allowedFeatures: ['EXAM_CREATION', 'OSCE_GRADING', 'MENTORING', 'QUESTION_REVIEW']
    }
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
    restrictions: {
      allowedRoles: [UserRole.SUPER_ADMIN, UserRole.PROGRAM_ADMIN, UserRole.TEACHER, UserRole.STUDENT],
      maxSessionDuration: 240 * 60 * 1000, // 4 hours
      allowedFeatures: ['ALL_ADMIN_FEATURES']
    }
  },
  'surgery@sinaesta.com': {
    password: 'demo123',
    user: {
      id: 'demo-surgery-id',
      name: 'Surgery Demo',
      email: 'surgery@sinaesta.com',
      role: UserRole.STUDENT as const,
      status: 'VERIFIED',
      targetSpecialty: 'Surgery',
      institution: 'Sinaesta Demo',
      avatar: 'https://ui-avatars.com/api/?name=Surgery+Demo&background=EF4444&color=fff',
    },
    restrictions: {
      allowedRoles: [UserRole.STUDENT],
      maxSessionDuration: 30 * 60 * 1000, // 30 minutes
      allowedFeatures: ['EXAM_TAKING', 'FLASHCARDS', 'MICROLEARNING']
    }
  },
  'pediatrics@sinaesta.com': {
    password: 'demo123',
    user: {
      id: 'demo-pediatrics-id',
      name: 'Pediatrics Demo',
      email: 'pediatrics@sinaesta.com',
      role: UserRole.STUDENT as const,
      status: 'VERIFIED',
      targetSpecialty: 'Pediatrics',
      institution: 'Sinaesta Demo',
      avatar: 'https://ui-avatars.com/api/?name=Pediatrics+Demo&background=F59E0B&color=fff',
    },
    restrictions: {
      allowedRoles: [UserRole.STUDENT],
      maxSessionDuration: 30 * 60 * 1000, // 30 minutes
      allowedFeatures: ['EXAM_TAKING', 'FLASHCARDS', 'MICROLEARNING']
    }
  },
  'obgyn@sinaesta.com': {
    password: 'demo123',
    user: {
      id: 'demo-obgyn-id',
      name: 'Obgyn Demo',
      email: 'obgyn@sinaesta.com',
      role: UserRole.STUDENT as const,
      status: 'VERIFIED',
      targetSpecialty: 'Obgyn',
      institution: 'Sinaesta Demo',
      avatar: 'https://ui-avatars.com/api/?name=Obgyn+Demo&background=EC4899&color=fff',
    },
    restrictions: {
      allowedRoles: [UserRole.STUDENT],
      maxSessionDuration: 30 * 60 * 1000, // 30 minutes
      allowedFeatures: ['EXAM_TAKING', 'FLASHCARDS', 'MICROLEARNING']
    }
  },
  'cardiology@sinaesta.com': {
    password: 'demo123',
    user: {
      id: 'demo-cardiology-id',
      name: 'Cardiology Demo',
      email: 'cardiology@sinaesta.com',
      role: UserRole.STUDENT as const,
      status: 'VERIFIED',
      targetSpecialty: 'Cardiology',
      institution: 'Sinaesta Demo',
      avatar: 'https://ui-avatars.com/api/?name=Cardiology+Demo&background=3B82F6&color=fff',
    },
    restrictions: {
      allowedRoles: [UserRole.STUDENT],
      maxSessionDuration: 30 * 60 * 1000, // 30 minutes
      allowedFeatures: ['EXAM_TAKING', 'FLASHCARDS', 'MICROLEARNING']
    }
  },
};

class DemoAuthService {
  private isBackendEnabled: boolean = true;
  private debugMode: boolean = false;

  constructor() {
    // Check if backend should be disabled (for demo mode)
    this.isBackendEnabled = localStorage.getItem('backendEnabled') !== 'false';
    // Enable debug mode if specified
    this.debugMode = localStorage.getItem('demoDebugMode') === 'true';
  }

  // Enable/disable backend communication
  setBackendEnabled(enabled: boolean): void {
    this.isBackendEnabled = enabled;
    localStorage.setItem('backendEnabled', enabled.toString());
  }

  isBackendActive(): boolean {
    return this.isBackendEnabled;
  }

  // Enable/disable debug mode
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    localStorage.setItem('demoDebugMode', enabled.toString());
    this.logDebug('Debug mode toggled', { enabled });
  }

  isDebugMode(): boolean {
    return this.debugMode;
  }

  // Debug logging helper
  private logDebug(message: string, data?: any): void {
    if (this.debugMode) {
      console.log(`[DemoAuth Debug] ${message}`, data);
    }
  }

  // Get available demo accounts for debugging
  getAvailableDemoAccounts(): { email: string; role: string; description: string }[] {
    return Object.entries(DEMO_ACCOUNTS).map(([email, account]) => ({
      email,
      role: account.user.role,
      description: `${account.user.name} (${account.user.targetSpecialty})`
    }));
  }

  // Check if email is a demo account (case-insensitive)
  isDemoAccount(email: string): boolean {
    const normalizedEmail = email.toLowerCase().trim();
    const isDemo = normalizedEmail in DEMO_ACCOUNTS;
    this.logDebug('isDemoAccount check', { email, normalizedEmail, isDemo });
    return isDemo;
  }

  // Get demo account restrictions (case-insensitive)
  getDemoAccountRestrictions(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Find account with case-insensitive comparison
    for (const [demoEmail, account] of Object.entries(DEMO_ACCOUNTS)) {
      if (demoEmail.toLowerCase() === normalizedEmail) {
        return account?.restrictions || null;
      }
    }
    
    return null;
  }

  // Authenticate demo account without backend
  async loginDemoAccount(email: string, password: string): Promise<AuthResponse> {
    this.logDebug('Attempting demo login', { email });
    
    // Convert email to lowercase for case-insensitive comparison
    const normalizedEmail = email.toLowerCase().trim();
    this.logDebug('Normalized email', { normalizedEmail });
    
    // Log all available demo accounts for debugging
    const availableEmails = Object.keys(DEMO_ACCOUNTS);
    this.logDebug('Available demo accounts', { availableEmails });
    
    // Try to find account with case-insensitive comparison
    let matchedAccount: typeof DEMO_ACCOUNTS[keyof typeof DEMO_ACCOUNTS] | null = null;
    let matchedEmail: string | null = null;
    
    for (const [demoEmail, account] of Object.entries(DEMO_ACCOUNTS)) {
      if (demoEmail.toLowerCase() === normalizedEmail) {
        matchedAccount = account;
        matchedEmail = demoEmail;
        break;
      }
    }
    
    if (!matchedAccount) {
      const errorMsg = `Demo account "${normalizedEmail}" not found. Available demo accounts: ${availableEmails.join(', ')}`;
      this.logDebug('Demo account not found', { normalizedEmail, availableEmails });
      throw new Error(errorMsg);
    }
    
    this.logDebug('Found demo account', { matchedEmail, user: matchedAccount.user.name });

    if (matchedAccount.password !== password) {
      const errorMsg = `Invalid password for demo account "${matchedEmail}". Expected: "${matchedAccount.password}", Received: "${password}"`;
      this.logDebug('Invalid password', { matchedEmail, expected: matchedAccount.password, received: password });
      throw new Error(errorMsg);
    }

    // SECURITY FIX: Validate session duration
    const now = Date.now();
    const lastLogin = localStorage.getItem(`demo_last_login_${matchedEmail}`);
    if (lastLogin) {
      const timeSinceLastLogin = now - parseInt(lastLogin);
      if (timeSinceLastLogin < matchedAccount.restrictions.maxSessionDuration) {
        const remainingTime = matchedAccount.restrictions.maxSessionDuration - timeSinceLastLogin;
        const remainingMinutes = Math.ceil(remainingTime / (60 * 1000));
        const errorMsg = `Demo session limit reached for "${matchedEmail}". Please wait ${remainingMinutes} minutes before logging in again.`;
        this.logDebug('Session limit reached', { matchedEmail, remainingMinutes });
        throw new Error(errorMsg);
      }
    }

    // Update last login time
    localStorage.setItem(`demo_last_login_${matchedEmail}`, now.toString());

    // Generate mock tokens
    const accessToken = this.generateMockToken(matchedAccount.user);
    const refreshToken = this.generateMockToken(matchedAccount.user, 'refresh');

    // Log successful login
    this.logSecurityEvent('DEMO_LOGIN_SUCCESS', matchedEmail!, matchedAccount.user.role, {
      allowedRoles: matchedAccount.restrictions.allowedRoles,
      sessionDuration: matchedAccount.restrictions.maxSessionDuration
    });

    this.logDebug('Demo login successful', { user: matchedAccount.user.name, email: matchedEmail });

    return {
      accessToken,
      refreshToken,
      user: matchedAccount.user,
    };
  }

  // Try demo login
  async tryDemoLogin(email: string, password: string): Promise<AuthResponse> {
    this.logDebug('Attempting tryDemoLogin', { email });
    
    // Convert email to lowercase for case-insensitive comparison
    const normalizedEmail = email.toLowerCase().trim();
    this.logDebug('Normalized email for tryDemoLogin', { normalizedEmail });
    
    // If this is a demo account, try demo login
    if (this.isDemoAccount(normalizedEmail)) {
      this.logDebug('Is demo account, attempting demo login');
      try {
        return await this.loginDemoAccount(email, password);
      } catch (demoError) {
        // If it's a security limit error, rethrow it
        if (demoError.message.includes('limit reached')) {
          this.logDebug('Session limit reached, rethrowing error');
          throw demoError;
        }
        
        // Log failed demo login attempt
        this.logSecurityEvent('DEMO_LOGIN_FAILED', normalizedEmail, UserRole.STUDENT, {
          error: demoError.message
        });
        
        this.logDebug('Demo login failed', { error: demoError.message });
        throw demoError;
      }
    }

    this.logDebug('Not a demo account, checking mock registration');
    
    // Check if we have this user in mock registration
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '{}');
    
    // Try case-insensitive lookup in mock users
    let foundMockUser = null;
    let foundEmail = null;
    for (const [mockEmail, mockUser] of Object.entries(mockUsers)) {
      if (mockEmail.toLowerCase() === normalizedEmail) {
        foundMockUser = mockUser;
        foundEmail = mockEmail;
        break;
      }
    }
    
    if (foundMockUser && foundMockUser.password === password) {
      this.logDebug('Found mock user', { email: foundEmail });
      return {
        accessToken: this.generateMockToken(foundMockUser.user),
        refreshToken: this.generateMockToken(foundMockUser.user, 'refresh'),
        user: foundMockUser.user
      };
    }

    const errorMsg = `Akun "${normalizedEmail}" bukan akun demo dan tidak ditemukan di penyimpanan lokal. Available demo accounts: ${Object.keys(DEMO_ACCOUNTS).join(', ')}`;
    this.logDebug('Mock user not found', { normalizedEmail, availableDemoAccounts: Object.keys(DEMO_ACCOUNTS) });
    throw new Error(errorMsg);
  }

  // Mock registration for demo purposes
  async register(data: any): Promise<AuthResponse> {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // If backend is active, this should normally be handled by apiService
    // but if we are here, we are either in demo mode or backend is down

    const newUser: User = {
      id: `mock-user-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role || UserRole.STUDENT,
      status: 'VERIFIED',
      targetSpecialty: data.targetSpecialty || 'Internal Medicine',
      institution: data.institution || 'Sinaesta Mock',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=0D8ABC&color=fff`,
    };

    // Store in localStorage
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '{}');
    mockUsers[data.email] = {
      password: data.password,
      user: newUser
    };
    localStorage.setItem('mock_users', JSON.stringify(mockUsers));

    return {
      accessToken: this.generateMockToken(newUser),
      refreshToken: this.generateMockToken(newUser, 'refresh'),
      user: newUser,
    };
  }

  // SECURITY FIX: Validate demo account role switching
  validateRoleSwitch(email: string, currentRole: UserRole, targetRole: UserRole): boolean {
    const account = DEMO_ACCOUNTS[email as keyof typeof DEMO_ACCOUNTS];
    
    if (!account) {
      this.logSecurityEvent('UNAUTHORIZED_ROLE_SWITCH_ATTEMPT', email, currentRole, {
        targetRole,
        reason: 'Unknown demo account'
      });
      return false;
    }

    // Check if target role is allowed for this demo account
    if (!account.restrictions.allowedRoles.includes(targetRole)) {
      this.logSecurityEvent('UNAUTHORIZED_ROLE_SWITCH_ATTEMPT', email, currentRole, {
        targetRole,
        allowedRoles: account.restrictions.allowedRoles,
        reason: 'Role not in allowed roles'
      });
      return false;
    }

    // Log successful role switch
    this.logSecurityEvent('DEMO_ROLE_SWITCH_SUCCESS', email, currentRole, {
      targetRole,
      allowedRoles: account.restrictions.allowedRoles
    });

    return true;
  }

  // Check if demo account can access specific feature
  canAccessFeature(email: string, feature: string): boolean {
    const account = DEMO_ACCOUNTS[email as keyof typeof DEMO_ACCOUNTS];
    
    if (!account) {
      return false;
    }

    if (account.restrictions.allowedFeatures.includes('ALL_ADMIN_FEATURES')) {
      return true; // Admin can access everything
    }

    return account.restrictions.allowedFeatures.includes(feature);
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

  // SECURITY FIX: Log security events
  private logSecurityEvent(eventType: string, email: string, role: UserRole, details: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventType,
      email,
      role,
      details,
      source: 'demo-auth-service'
    };

    console.warn(`SECURITY EVENT: ${eventType}`, logEntry);

    // Store in localStorage for demo purposes (remove in production)
    const securityLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    securityLogs.push(logEntry);
    
    // Keep only last 100 entries
    if (securityLogs.length > 100) {
      securityLogs.splice(0, securityLogs.length - 100);
    }
    
    localStorage.setItem('security_logs', JSON.stringify(securityLogs));
  }

  // Get security logs for debugging (demo purposes)
  getSecurityLogs(): any[] {
    return JSON.parse(localStorage.getItem('security_logs') || '[]');
  }

  // Clear security logs
  clearSecurityLogs(): void {
    localStorage.removeItem('security_logs');
  }

  // Mock backend responses for demo mode
  async mockBackendRequest(endpoint: string, method: string = 'GET', data?: any): Promise<any> {
    if (this.isBackendEnabled) {
      throw new Error('Backend is enabled, use real API calls');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // SECURITY FIX: Validate endpoint access for demo accounts
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (this.isDemoAccount(user.email)) {
        // Check if this demo account can access this endpoint
        const restrictedEndpoints = ['/admin/users', '/admin/analytics', '/admin/system'];
        const isRestrictedEndpoint = restrictedEndpoints.some(restricted => endpoint.includes(restricted));
        
        if (isRestrictedEndpoint && !this.canAccessFeature(user.email, 'ALL_ADMIN_FEATURES')) {
          this.logSecurityEvent('UNAUTHORIZED_ENDPOINT_ACCESS', user.email, user.role, {
            endpoint,
            method
          });
          throw new Error('Demo account does not have access to this endpoint');
        }
      }
    }

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