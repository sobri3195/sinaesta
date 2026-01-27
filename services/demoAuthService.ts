// Demo Authentication Service - Bypass backend for demo accounts
import { AuthResponse, User, UserRole } from '../types';
import { authService } from './authService';
import jwt from 'jsonwebtoken';

// Demo secret key (only for demo purposes)
const DEMO_JWT_SECRET = 'sinaesta-demo-secret-key-for-local-testing-only';

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
  private bypassAllPermissions: boolean = false;

  constructor() {
    // Check if backend should be disabled (for demo mode)
    this.isBackendEnabled = localStorage.getItem('backendEnabled') !== 'false';
    // Enable debug mode if specified
    this.debugMode = localStorage.getItem('demoDebugMode') === 'true';
    // Check if permission bypass is enabled
    this.bypassAllPermissions = localStorage.getItem('demo_bypass_permissions') === 'true';
    // Cleanup old sessions on initialization
    this.cleanupOldSessions();
    // NEW: Clear invalid tokens on initialization
    this.clearInvalidTokens();
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

  // Enable/disable bypass all permissions (demo only)
  setBypassAllPermissions(enabled: boolean): void {
    this.bypassAllPermissions = enabled;
    localStorage.setItem('demo_bypass_permissions', enabled.toString());
    this.logDebug('Bypass all permissions toggled', { enabled });
  }

  isBypassAllPermissionsActive(): boolean {
    const stored = localStorage.getItem('demo_bypass_permissions');
    if (stored !== null) {
      this.bypassAllPermissions = stored === 'true';
    }
    return this.bypassAllPermissions;
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

  // Get demo account by email
  private getDemoAccount(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    for (const [demoEmail, account] of Object.entries(DEMO_ACCOUNTS)) {
      if (demoEmail.toLowerCase() === normalizedEmail) {
        return account;
      }
    }
    
    // Check mock users too
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '{}');
    for (const [mockEmail, mockUser] of Object.entries(mockUsers)) {
      if (mockEmail.toLowerCase() === normalizedEmail) {
        return mockUser;
      }
    }
    
    return null;
  }

  // Authenticate demo account without backend
  async loginDemoAccount(email: string, password: string): Promise<AuthResponse> {
    this.logDebug('Attempting demo login', { email });
    
    const matchedAccount = this.getDemoAccount(email);
    const matchedEmail = matchedAccount ? (matchedAccount.user?.email || email) : email;
    
    if (!matchedAccount) {
      const errorMsg = `Demo account "${email}" not found.`;
      this.logDebug('Demo account not found', { email });
      throw new Error(errorMsg);
    }
    
    this.logDebug('Found demo account', { matchedEmail, user: matchedAccount.user.name });

    if (matchedAccount.password !== password) {
      const errorMsg = `Invalid password for demo account "${matchedEmail}".`;
      this.logDebug('Invalid password', { matchedEmail });
      throw new Error(errorMsg);
    }

    // SECURITY FIX: Validate session duration
    const now = Date.now();
    const lastLoginKey = `demo_last_login_${matchedEmail.toLowerCase().trim()}`;
    const sessionStartKey = `demo_session_start_${matchedEmail.toLowerCase().trim()}`;
    const sessionExpiryKey = `demo_session_expiry_${matchedEmail.toLowerCase().trim()}`;
    
    const sessionExpiry = localStorage.getItem(sessionExpiryKey);
    
    if (sessionExpiry) {
      const expiryTime = parseInt(sessionExpiry);
      
      // If session has truly expired and it's recent (within last 24h)
      if (now > expiryTime && now < expiryTime + 24 * 60 * 60 * 1000) {
        const remainingCooling = (expiryTime + 24 * 60 * 60 * 1000) - now;
        const coolingHours = Math.ceil(remainingCooling / (60 * 60 * 1000));
        
        this.logDebug('Session limit reached', { matchedEmail, coolingHours });
        throw new Error(`Demo session limit reached for ${matchedEmail}. Please wait ${coolingHours} hours or contact support to reset your demo access.`);
      }
      
      // If session is still active, we allow re-login (e.g. page refresh) 
      // but we DON'T extend the session.
      if (now <= expiryTime) {
        this.logDebug('Active session found, allowing re-login', { 
          matchedEmail, 
          remaining: Math.ceil((expiryTime - now) / 60000) + ' min' 
        });
      } else {
        // Session expired a long time ago (> 24h), reset it
        this.resetSession(matchedEmail);
      }
    }

    // If no active or recent session, start a new one
    if (!localStorage.getItem(sessionExpiryKey)) {
      localStorage.setItem(lastLoginKey, now.toString());
      localStorage.setItem(sessionStartKey, now.toString());
      localStorage.setItem(sessionExpiryKey, (now + matchedAccount.restrictions.maxSessionDuration).toString());
    } else {
      // Update last login only
      localStorage.setItem(lastLoginKey, now.toString());
    }

    // Generate mock tokens
    const accessToken = this.generateMockToken(matchedAccount.user);
    const refreshToken = this.generateMockToken(matchedAccount.user, 'refresh');

    // Store tokens and metadata
    this.storeTokenMetadata(accessToken, refreshToken);

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
      const accessToken = this.generateMockToken(foundMockUser.user);
      const refreshToken = this.generateMockToken(foundMockUser.user, 'refresh');
      
      this.storeTokenMetadata(accessToken, refreshToken);

      return {
        accessToken,
        refreshToken,
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

    // Generate tokens
    const accessToken = this.generateMockToken(newUser);
    const refreshToken = this.generateMockToken(newUser, 'refresh');

    // Store tokens and metadata
    this.storeTokenMetadata(accessToken, refreshToken);

    return {
      accessToken,
      refreshToken,
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
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      type,
      iat: Math.floor(Date.now() / 1000),
      // Admin gets 4 hours for access token, others 1 hour. Refresh tokens are always 24h for demo.
      exp: Math.floor(Date.now() / 1000) + (
        type === 'access' 
          ? (user.role === UserRole.SUPER_ADMIN ? 4 * 3600 : 3600) 
          : 86400
      ),
    };

    try {
      return jwt.sign(payload, DEMO_JWT_SECRET);
    } catch (e) {
      this.logDebug('Error signing JWT with library, falling back to manual', e);
      // Fallback to manual if library fails in browser
      const header = { alg: 'HS256', typ: 'JWT' };
      const encodedHeader = btoa(JSON.stringify(header));
      const encodedPayload = btoa(JSON.stringify(payload));
      const signature = btoa(DEMO_JWT_SECRET).substring(0, 16); // Simple mock signature
      return `${encodedHeader}.${encodedPayload}.${signature}`;
    }
  }

  // Verify and decode mock token
  verifyMockToken(token: string): any {
    if (!token) return null;
    
    try {
      return jwt.verify(token, DEMO_JWT_SECRET);
    } catch (e) {
      // Manual verification fallback
      try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        const payload = JSON.parse(atob(parts[1]));
        const signature = parts[2];
        
        // Simple signature check for fallback
        if (signature !== btoa(DEMO_JWT_SECRET).substring(0, 16)) {
          return null;
        }

        // Check expiration
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
          return null;
        }

        return payload;
      } catch (err) {
        return null;
      }
    }
  }

  // NEW: Store token metadata in localStorage
  private storeTokenMetadata(accessToken: string, refreshToken: string): void {
    try {
      const decodedAccess = this.decodeToken(accessToken);
      const decodedRefresh = this.decodeToken(refreshToken);

      if (decodedAccess && decodedRefresh) {
        const metadata = {
          accessToken: {
            createdAt: decodedAccess.iat * 1000,
            expiresAt: decodedAccess.exp * 1000,
            type: 'access'
          },
          refreshToken: {
            createdAt: decodedRefresh.iat * 1000,
            expiresAt: decodedRefresh.exp * 1000,
            type: 'refresh'
          },
          updatedAt: Date.now()
        };

        localStorage.setItem('demo_token_metadata', JSON.stringify(metadata));
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      }
    } catch (e) {
      console.error('Error storing token metadata', e);
    }
  }

  // Helper to decode token without verification
  private decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (e) {
      try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        return JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      } catch (err) {
        return null;
      }
    }
  }

  // NEW: Validate token format
  validateTokenFormat(token: string): boolean {
    if (!token) return false;
    const parts = token.split('.');
    return parts.length === 3;
  }

  // NEW: Clear invalid tokens from localStorage
  clearInvalidTokens(): void {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken && !this.validateTokenFormat(accessToken)) {
      localStorage.removeItem('accessToken');
      this.logDebug('Removed invalid accessToken format');
    }

    if (refreshToken && !this.validateTokenFormat(refreshToken)) {
      localStorage.removeItem('refreshToken');
      this.logDebug('Removed invalid refreshToken format');
    }

    // Check expiration if they are demo tokens
    if (accessToken) {
      const decoded = this.verifyMockToken(accessToken);
      if (!decoded && accessToken.includes('.')) { // Likely a demo token but expired/invalid signature
        localStorage.removeItem('accessToken');
        this.logDebug('Removed expired or invalid demo accessToken');
      }
    }
  }

  // NEW: Get current token status
  getDemoTokenStatus() {
    const metadataStr = localStorage.getItem('demo_token_metadata');
    if (!metadataStr) return null;

    try {
      const metadata = JSON.parse(metadataStr);
      const now = Date.now();
      
      return {
        ...metadata,
        isAccessExpired: now > metadata.accessToken.expiresAt,
        isRefreshExpired: now > metadata.refreshToken.expiresAt,
        accessRemaining: Math.max(0, metadata.accessToken.expiresAt - now),
        refreshRemaining: Math.max(0, metadata.refreshToken.expiresAt - now)
      };
    } catch (e) {
      return null;
    }
  }

  // NEW: Refresh demo tokens
  async refreshDemoTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Validate the refresh token
      const decoded = this.verifyMockToken(refreshToken);
      if (!decoded || decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      // Find the user
      const email = decoded.email;
      const account = this.getDemoAccount(email);
      
      if (!account) {
        throw new Error('User not found');
      }

      // Generate new tokens
      const newAccessToken = this.generateMockToken(account.user);
      const newRefreshToken = this.generateMockToken(account.user, 'refresh');

      // Update metadata and storage
      this.storeTokenMetadata(newAccessToken, newRefreshToken);

      this.logDebug('Demo tokens refreshed', { email });
      
      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      this.logDebug('Token refresh failed', { error: error.message });
      throw error;
    }
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

  // NEW: Reset session for a specific email
  resetSession(email: string): void {
    const normalizedEmail = email.toLowerCase().trim();
    localStorage.removeItem(`demo_last_login_${normalizedEmail}`);
    localStorage.removeItem(`demo_session_start_${normalizedEmail}`);
    localStorage.removeItem(`demo_session_expiry_${normalizedEmail}`);
    this.logDebug('Session reset', { email: normalizedEmail });
  }

  // NEW: Extend session for demo admin
  extendSession(email: string, durationMs: number = 30 * 60 * 1000): void {
    const normalizedEmail = email.toLowerCase().trim();
    const expiryKey = `demo_session_expiry_${normalizedEmail}`;
    const currentExpiry = localStorage.getItem(expiryKey);
    
    if (currentExpiry) {
      const newExpiry = parseInt(currentExpiry) + durationMs;
      localStorage.setItem(expiryKey, newExpiry.toString());
      this.logDebug('Session extended', { email: normalizedEmail, extendedBy: durationMs });
    }
  }

  // NEW: Get remaining session time in milliseconds
  getRemainingSessionTime(email: string): number {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const expiry = localStorage.getItem(`demo_session_expiry_${normalizedEmail}`);
      if (!expiry) return 0;

      const expiryTime = parseInt(expiry);
      if (isNaN(expiryTime)) {
        this.resetSession(normalizedEmail);
        return 0;
      }

      const remaining = expiryTime - Date.now();
      return Math.max(0, remaining);
    } catch (e) {
      console.error('Error getting remaining session time', e);
      return 0;
    }
  }

  // NEW: Cleanup old session data
  cleanupOldSessions(): void {
    try {
      const keysToRemove: string[] = [];
      const now = Date.now();

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;

        if (key.startsWith('demo_last_login_') ||
            key.startsWith('demo_session_start_') ||
            key.startsWith('demo_session_expiry_')) {

          const value = localStorage.getItem(key);
          if (!value || isNaN(parseInt(value))) {
            keysToRemove.push(key);
            continue;
          }

          // If it's an expiry key, check if it's expired for more than 24 hours
          if (key.startsWith('demo_session_expiry_')) {
            const expiry = parseInt(value);
            if (expiry < now - 24 * 60 * 60 * 1000) {
              keysToRemove.push(key);
              const email = key.replace('demo_session_expiry_', '');
              keysToRemove.push(`demo_last_login_${email}`);
              keysToRemove.push(`demo_session_start_${email}`);
            }
          }
        }
      }

      // Remove duplicates and actually remove from localStorage
      const uniqueKeysToRemove = [...new Set(keysToRemove)];
      uniqueKeysToRemove.forEach(key => localStorage.removeItem(key));

      if (uniqueKeysToRemove.length > 0) {
        this.logDebug('Cleanup completed', { removedKeys: uniqueKeysToRemove.length, keys: uniqueKeysToRemove });
      }
    } catch (e) {
      console.error('Error during session cleanup', e);
    }
  }

  // NEW: Get all demo-related localStorage data
  getDemoDebugData(): any {
    const data: any = {
      timestamp: Date.now(),
      currentTime: new Date().toISOString(),
      localStorage: {}
    };
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('demo') || key.includes('mock') || key.includes('sinaesta'))) {
        data.localStorage[key] = localStorage.getItem(key);
      }
    }
    
    return data;
  }

  // NEW: Clear all demo data
  clearAllDemoData(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('demo_') || key.includes('mock_') || key === 'security_logs')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    this.logDebug('All demo data cleared');
  }

  // Mock backend responses for demo mode
  async mockBackendRequest(endpoint: string, method: string = 'GET', data?: any): Promise<any> {
    if (this.isBackendEnabled) {
      throw new Error('Backend is enabled, use real API calls');
    }

    // Simulate API delay (200-500ms for realism)
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

    this.logDebug(`Mock API Request: ${method} ${endpoint}`, { data });

    // Check if bypass all permissions is active
    if (this.isBypassAllPermissionsActive()) {
      this.logDebug('Permission bypass active, allowing endpoint access', { endpoint, method });
    } else {
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
    }

    // Get current user for filtering data
    const getCurrentUser = () => {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    };

    // Helper to load mock data generators
    const loadMockData = async () => {
      const { 
        generateExamsForSpecialty, 
        generateFlashcardDecks, 
        generateOSCEStations,
        generateSpotDxItems,
        generateMicrolearningPacks,
        generateCaseVignettes
      } = await import('../mockData');
      return {
        generateExamsForSpecialty,
        generateFlashcardDecks,
        generateOSCEStations,
        generateSpotDxItems,
        generateMicrolearningPacks,
        generateCaseVignettes
      };
    };

    // Parse query parameters
    const parseQueryParams = (url: string) => {
      const [, queryString] = url.split('?');
      if (!queryString) return {};
      return Object.fromEntries(new URLSearchParams(queryString));
    };

    const params = parseQueryParams(endpoint);
    const currentUser = getCurrentUser();

    // Mock responses for common endpoints
    try {
      // ========== AUTH ENDPOINTS ==========
      if (endpoint === '/auth/login' && method === 'POST') {
        if (data?.email && data?.password) {
          return this.tryDemoLogin(data.email, data.password);
        }
        throw new Error('Email and password required');
      }

      if (endpoint === '/auth/logout' && method === 'POST') {
        return { success: true, message: 'Logged out successfully' };
      }

      if (endpoint === '/auth/refresh' && method === 'POST') {
        if (data?.refreshToken) {
          const tokens = await this.refreshDemoTokens(data.refreshToken);
          return { data: tokens };
        }
        throw new Error('Refresh token required');
      }

      // ========== USER ENDPOINTS ==========
      if (endpoint === '/users/me' && method === 'GET') {
        if (!currentUser) {
          throw new Error('Not authenticated');
        }
        return { data: currentUser };
      }

      if (endpoint.match(/^\/users\/[^/]+$/) && method === 'GET') {
        const userId = endpoint.split('/')[2];
        if (currentUser && currentUser.id === userId) {
          return { data: currentUser };
        }
        return { data: { ...currentUser, id: userId, name: 'Demo User ' + userId.slice(0, 8) } };
      }

      if (endpoint.match(/^\/users\/[^/]+$/) && method === 'PUT') {
        if (currentUser) {
          const updatedUser = { ...currentUser, ...data };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          return { data: updatedUser };
        }
        throw new Error('Not authenticated');
      }

      if (endpoint === '/users' && method === 'GET') {
        // Return mock user list for admin
        return {
          data: [currentUser].filter(Boolean),
          total: 1,
          page: parseInt(params.page || '1'),
          limit: parseInt(params.limit || '10')
        };
      }

      // ========== EXAM ENDPOINTS ==========
      if (endpoint === '/exams' && method === 'GET') {
        const mockData = await loadMockData();
        const specialty = params.specialty || currentUser?.targetSpecialty || 'Internal Medicine';
        const exams = mockData.generateExamsForSpecialty(specialty);
        
        // Apply filters
        let filteredExams = exams;
        if (params.difficulty) {
          filteredExams = filteredExams.filter(e => e.difficulty === params.difficulty);
        }

        return {
          data: filteredExams,
          total: filteredExams.length,
          page: parseInt(params.page || '1'),
          limit: parseInt(params.limit || '10')
        };
      }

      if (endpoint.match(/^\/exams\/[^/]+$/) && method === 'GET') {
        const examId = endpoint.split('/')[2];
        const mockData = await loadMockData();
        const specialty = currentUser?.targetSpecialty || 'Internal Medicine';
        const exams = mockData.generateExamsForSpecialty(specialty);
        const exam = exams.find(e => e.id === examId) || exams[0];
        
        if (!exam) {
          throw new Error('Exam not found');
        }
        
        return { data: exam };
      }

      if (endpoint === '/exams' && method === 'POST') {
        // Create exam
        const newExam = {
          ...data,
          id: `exam-${Date.now()}`,
          createdAt: Date.now(),
          createdBy: currentUser?.id
        };
        
        // Store in localStorage
        const storedExams = JSON.parse(localStorage.getItem('demo_exams') || '[]');
        storedExams.push(newExam);
        localStorage.setItem('demo_exams', JSON.stringify(storedExams));
        
        return { data: newExam };
      }

      if (endpoint.match(/^\/exams\/[^/]+\/submit$/) && method === 'POST') {
        const examId = endpoint.split('/')[2];
        
        // Calculate score
        const answers = data.answers || [];
        const correctCount = answers.filter((a: any) => a.isCorrect).length;
        const score = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;
        
        const result = {
          id: `result-${Date.now()}`,
          examId,
          userId: currentUser?.id,
          score,
          totalQuestions: answers.length,
          correctAnswers: correctCount,
          answers,
          startedAt: Date.now() - (data.timeSpent || 0) * 1000,
          completedAt: Date.now(),
          timeSpent: data.timeSpent || 0
        };
        
        // Store result
        const results = JSON.parse(localStorage.getItem('demo_results') || '[]');
        results.push(result);
        localStorage.setItem('demo_results', JSON.stringify(results));
        
        return { data: result };
      }

      if (endpoint.match(/^\/exams\/[^/]+\/results$/) && method === 'GET') {
        const examId = endpoint.split('/')[2];
        const results = JSON.parse(localStorage.getItem('demo_results') || '[]');
        const examResults = results.filter((r: any) => r.examId === examId);
        
        if (params.userId) {
          return { data: examResults.filter((r: any) => r.userId === params.userId) };
        }
        
        return { data: examResults };
      }

      // ========== RESULTS ENDPOINTS ==========
      if (endpoint === '/results' && method === 'GET') {
        const results = JSON.parse(localStorage.getItem('demo_results') || '[]');
        let filtered = results;
        
        if (params.userId) {
          filtered = filtered.filter((r: any) => r.userId === params.userId);
        }
        if (params.examId) {
          filtered = filtered.filter((r: any) => r.examId === params.examId);
        }
        
        return {
          data: filtered.reverse(),
          total: filtered.length,
          page: parseInt(params.page || '1'),
          limit: parseInt(params.limit || '10')
        };
      }

      if (endpoint === '/results/my-results' && method === 'GET') {
        const results = JSON.parse(localStorage.getItem('demo_results') || '[]');
        const myResults = results.filter((r: any) => r.userId === currentUser?.id);
        
        return {
          data: myResults.reverse(),
          total: myResults.length,
          page: parseInt(params.page || '1'),
          limit: parseInt(params.limit || '10')
        };
      }

      if (endpoint.match(/^\/results\/[^/]+$/) && method === 'GET') {
        const resultId = endpoint.split('/')[2];
        const results = JSON.parse(localStorage.getItem('demo_results') || '[]');
        const result = results.find((r: any) => r.id === resultId);
        
        if (!result) {
          throw new Error('Result not found');
        }
        
        return { data: result };
      }

      if (endpoint.match(/^\/results\/stats/) && method === 'GET') {
        const results = JSON.parse(localStorage.getItem('demo_results') || '[]');
        const userResults = results.filter((r: any) => r.userId === currentUser?.id);
        
        const stats = {
          totalExams: userResults.length,
          averageScore: userResults.length > 0 
            ? Math.round(userResults.reduce((sum: number, r: any) => sum + r.score, 0) / userResults.length)
            : 0,
          totalTimeSpent: userResults.reduce((sum: number, r: any) => sum + (r.timeSpent || 0), 0),
          bestScore: userResults.length > 0 
            ? Math.max(...userResults.map((r: any) => r.score))
            : 0,
          recentResults: userResults.slice(-5).reverse()
        };
        
        return { data: stats };
      }

      // ========== FLASHCARD ENDPOINTS ==========
      if (endpoint === '/flashcards' && method === 'GET') {
        const mockData = await loadMockData();
        const specialty = currentUser?.targetSpecialty || 'Internal Medicine';
        const decks = mockData.generateFlashcardDecks(specialty);
        
        // Flatten to individual cards
        const allCards = decks.flatMap(deck => 
          deck.cards.map(card => ({
            ...card,
            deckId: deck.id,
            deckTitle: deck.title,
            category: deck.topic
          }))
        );
        
        let filtered = allCards;
        if (params.category) {
          filtered = filtered.filter(c => c.category === params.category);
        }
        
        return {
          data: filtered,
          total: filtered.length,
          page: parseInt(params.page || '1'),
          limit: parseInt(params.limit || '20')
        };
      }

      if (endpoint === '/flashcards/decks/all' && method === 'GET') {
        const mockData = await loadMockData();
        const specialty = currentUser?.targetSpecialty || 'Internal Medicine';
        const decks = mockData.generateFlashcardDecks(specialty);
        
        return {
          data: decks,
          total: decks.length
        };
      }

      if (endpoint.match(/^\/flashcards\/[^/]+$/) && method === 'GET') {
        const cardId = endpoint.split('/')[2];
        const mockData = await loadMockData();
        const specialty = currentUser?.targetSpecialty || 'Internal Medicine';
        const decks = mockData.generateFlashcardDecks(specialty);
        
        const allCards = decks.flatMap(deck => deck.cards);
        const card = allCards.find(c => c.id === cardId);
        
        if (!card) {
          throw new Error('Flashcard not found');
        }
        
        return { data: card };
      }

      if (endpoint === '/flashcards' && method === 'POST') {
        const newCard = {
          ...data,
          id: `card-${Date.now()}`
        };
        
        const cards = JSON.parse(localStorage.getItem('demo_flashcards') || '[]');
        cards.push(newCard);
        localStorage.setItem('demo_flashcards', JSON.stringify(cards));
        
        return { data: newCard };
      }

      if (endpoint === '/flashcards/decks' && method === 'POST') {
        const newDeck = {
          ...data,
          id: `deck-${Date.now()}`,
          createdAt: Date.now()
        };
        
        const decks = JSON.parse(localStorage.getItem('demo_decks') || '[]');
        decks.push(newDeck);
        localStorage.setItem('demo_decks', JSON.stringify(decks));
        
        return { data: newDeck };
      }

      // ========== OSCE ENDPOINTS ==========
      if (endpoint === '/osce/stations' && method === 'GET') {
        const mockData = await loadMockData();
        const specialty = params.specialty || currentUser?.targetSpecialty || 'Internal Medicine';
        const stations = mockData.generateOSCEStations(specialty);
        
        return {
          data: stations,
          total: stations.length,
          page: parseInt(params.page || '1'),
          limit: parseInt(params.limit || '10')
        };
      }

      if (endpoint.match(/^\/osce\/stations\/[^/]+$/) && method === 'GET') {
        const stationId = endpoint.split('/')[3];
        const mockData = await loadMockData();
        const specialty = currentUser?.targetSpecialty || 'Internal Medicine';
        const stations = mockData.generateOSCEStations(specialty);
        const station = stations.find(s => s.id === stationId) || stations[0];
        
        if (!station) {
          throw new Error('OSCE station not found');
        }
        
        return { data: station };
      }

      if (endpoint === '/osce/stations' && method === 'POST') {
        const newStation = {
          ...data,
          id: `osce-${Date.now()}`,
          createdAt: Date.now()
        };
        
        const stations = JSON.parse(localStorage.getItem('demo_osce_stations') || '[]');
        stations.push(newStation);
        localStorage.setItem('demo_osce_stations', JSON.stringify(stations));
        
        return { data: newStation };
      }

      if (endpoint === '/osce/attempts' && method === 'GET') {
        const attempts = JSON.parse(localStorage.getItem('demo_osce_attempts') || '[]');
        let filtered = attempts;
        
        if (params.stationId) {
          filtered = filtered.filter((a: any) => a.stationId === params.stationId);
        }
        
        return {
          data: filtered.filter((a: any) => a.userId === currentUser?.id).reverse(),
          total: filtered.length,
          page: parseInt(params.page || '1'),
          limit: parseInt(params.limit || '10')
        };
      }

      if (endpoint === '/osce/attempts' && method === 'POST') {
        const newAttempt = {
          ...data,
          id: `attempt-${Date.now()}`,
          userId: currentUser?.id,
          createdAt: Date.now()
        };
        
        const attempts = JSON.parse(localStorage.getItem('demo_osce_attempts') || '[]');
        attempts.push(newAttempt);
        localStorage.setItem('demo_osce_attempts', JSON.stringify(attempts));
        
        return { data: newAttempt };
      }

      // ========== ANALYTICS ENDPOINTS ==========
      if (endpoint.match(/^\/analytics/) && method === 'GET') {
        const results = JSON.parse(localStorage.getItem('demo_results') || '[]');
        const userResults = results.filter((r: any) => r.userId === currentUser?.id);
        
        const analytics = {
          overview: {
            totalExams: userResults.length,
            averageScore: userResults.length > 0 
              ? Math.round(userResults.reduce((sum: number, r: any) => sum + r.score, 0) / userResults.length)
              : 0,
            totalQuestions: userResults.reduce((sum: number, r: any) => sum + (r.totalQuestions || 0), 0),
            correctAnswers: userResults.reduce((sum: number, r: any) => sum + (r.correctAnswers || 0), 0)
          },
          byCategory: {},
          byDifficulty: {},
          progressOverTime: userResults.map((r: any) => ({
            date: r.completedAt,
            score: r.score
          }))
        };
        
        return { data: analytics };
      }

      // ========== SPOT DX ENDPOINTS ==========
      if (endpoint.match(/^\/spotdx/) && method === 'GET') {
        const mockData = await loadMockData();
        const specialty = params.specialty || currentUser?.targetSpecialty || 'Internal Medicine';
        const items = mockData.generateSpotDxItems(specialty);
        
        return {
          data: items,
          total: items.length
        };
      }

      // ========== MICROLEARNING ENDPOINTS ==========
      if (endpoint.match(/^\/microlearning/) && method === 'GET') {
        const mockData = await loadMockData();
        const specialty = currentUser?.targetSpecialty || 'Internal Medicine';
        const packs = mockData.generateMicrolearningPacks(specialty);
        
        return {
          data: packs,
          total: packs.length
        };
      }

      // ========== CASE VIGNETTES ENDPOINTS ==========
      if (endpoint.match(/^\/vignettes|\/cases/) && method === 'GET') {
        const mockData = await loadMockData();
        const specialty = currentUser?.targetSpecialty || 'Internal Medicine';
        const vignettes = mockData.generateCaseVignettes(specialty);
        
        return {
          data: vignettes,
          total: vignettes.length
        };
      }

      // ========== FILE UPLOAD ENDPOINTS ==========
      if (endpoint === '/upload' && method === 'POST') {
        // Mock file upload
        return {
          data: {
            fileId: `file-${Date.now()}`,
            url: 'https://via.placeholder.com/300',
            fileName: data.get?.('file')?.name || 'uploaded-file',
            size: data.get?.('file')?.size || 0,
            mimeType: data.get?.('file')?.type || 'application/octet-stream'
          }
        };
      }

      // ========== DEFAULT: ENDPOINT NOT FOUND ==========
      this.logDebug(`Mock endpoint not implemented: ${method} ${endpoint}`, { 
        availableEndpoints: this.getImplementedEndpoints() 
      });
      
      console.warn(
        `⚠️ Mock Endpoint Not Found: ${method} ${endpoint}\n` +
        `This endpoint is not yet implemented in demo mode.\n` +
        `See demo API documentation by calling: demoAuthService.getAPIDocumentation()`
      );

      // Return empty but valid response instead of throwing
      return { 
        data: method === 'GET' ? [] : {}, 
        total: 0,
        message: `Mock endpoint ${method} ${endpoint} not implemented yet` 
      };

    } catch (error) {
      this.logDebug(`Mock API Error: ${method} ${endpoint}`, { error });
      throw error;
    }
  }

  // Get list of implemented mock endpoints
  getImplementedEndpoints(): string[] {
    return [
      'POST /auth/login',
      'POST /auth/logout',
      'POST /auth/refresh',
      'GET /users/me',
      'GET /users/:id',
      'PUT /users/:id',
      'GET /users',
      'GET /exams',
      'GET /exams/:id',
      'POST /exams',
      'POST /exams/:id/submit',
      'GET /exams/:id/results',
      'GET /results',
      'GET /results/my-results',
      'GET /results/:id',
      'GET /results/stats/*',
      'GET /flashcards',
      'GET /flashcards/decks/all',
      'GET /flashcards/:id',
      'POST /flashcards',
      'POST /flashcards/decks',
      'GET /osce/stations',
      'GET /osce/stations/:id',
      'POST /osce/stations',
      'GET /osce/attempts',
      'POST /osce/attempts',
      'GET /analytics/*',
      'GET /spotdx/*',
      'GET /microlearning/*',
      'GET /vignettes/*',
      'POST /upload'
    ];
  }

  // Get mock API documentation
  getAPIDocumentation(): string {
    const docs = `
===========================================
SINAESTA DEMO MODE - MOCK API DOCUMENTATION
===========================================

🎯 STATUS: ${this.isBackendEnabled ? '❌ Backend Mode (Real API)' : '✅ Demo Mode (Mock API)'}

📚 IMPLEMENTED ENDPOINTS (${this.getImplementedEndpoints().length}):

AUTHENTICATION:
  POST   /auth/login          - Login with demo credentials
  POST   /auth/logout         - Logout (clears tokens)
  POST   /auth/refresh        - Refresh access token

USERS:
  GET    /users/me            - Get current user profile
  GET    /users/:id           - Get user by ID
  PUT    /users/:id           - Update user profile
  GET    /users               - List users (admin only)

EXAMS:
  GET    /exams               - List exams (filtered by specialty)
  GET    /exams/:id           - Get exam details
  POST   /exams               - Create new exam
  POST   /exams/:id/submit    - Submit exam answers
  GET    /exams/:id/results   - Get exam results

RESULTS:
  GET    /results             - List all results
  GET    /results/my-results  - Get current user's results
  GET    /results/:id         - Get specific result
  GET    /results/stats/*     - Get statistics

FLASHCARDS:
  GET    /flashcards          - List flashcards
  GET    /flashcards/decks/all- List all decks
  GET    /flashcards/:id      - Get flashcard by ID
  POST   /flashcards          - Create flashcard
  POST   /flashcards/decks    - Create deck

OSCE:
  GET    /osce/stations       - List OSCE stations
  GET    /osce/stations/:id   - Get station details
  POST   /osce/stations       - Create station
  GET    /osce/attempts       - List attempts
  POST   /osce/attempts       - Submit attempt

ANALYTICS:
  GET    /analytics/*         - Performance analytics

OTHER:
  GET    /spotdx/*            - Spot diagnosis items
  GET    /microlearning/*     - Microlearning packs
  GET    /vignettes/*         - Case vignettes
  POST   /upload              - File upload (mock)

💾 DATA STORAGE:
  - All data stored in localStorage with 'demo_' prefix
  - Results: demo_results
  - Exams: demo_exams
  - Flashcards: demo_flashcards
  - OSCE Attempts: demo_osce_attempts

🔧 USAGE:
  // Enable demo mode
  demoAuthService.setBackendEnabled(false);
  
  // Make mock API call
  const response = await demoAuthService.mockBackendRequest('/exams', 'GET');
  
  // Clear demo data
  demoAuthService.clearDemoDatabase();

📖 MORE INFO:
  See DEMO_ACCOUNT_TROUBLESHOOTING.md for complete guide
===========================================
    `;
    
    console.log(docs);
    return docs;
  }

  // Clear demo database
  clearDemoDatabase(): void {
    const demoKeys = [
      'demo_results',
      'demo_exams',
      'demo_flashcards',
      'demo_decks',
      'demo_osce_stations',
      'demo_osce_attempts'
    ];
    
    demoKeys.forEach(key => localStorage.removeItem(key));
    this.logDebug('Demo database cleared', { clearedKeys: demoKeys });
  }

  // Get demo database stats
  getDemoDBStats(): any {
    return {
      results: JSON.parse(localStorage.getItem('demo_results') || '[]').length,
      exams: JSON.parse(localStorage.getItem('demo_exams') || '[]').length,
      flashcards: JSON.parse(localStorage.getItem('demo_flashcards') || '[]').length,
      decks: JSON.parse(localStorage.getItem('demo_decks') || '[]').length,
      osceStations: JSON.parse(localStorage.getItem('demo_osce_stations') || '[]').length,
      osceAttempts: JSON.parse(localStorage.getItem('demo_osce_attempts') || '[]').length,
      totalSize: new Blob([
        localStorage.getItem('demo_results') || '',
        localStorage.getItem('demo_exams') || '',
        localStorage.getItem('demo_flashcards') || '',
        localStorage.getItem('demo_decks') || '',
        localStorage.getItem('demo_osce_stations') || '',
        localStorage.getItem('demo_osce_attempts') || ''
      ]).size
    };
  }
}

export const demoAuthService = new DemoAuthService();