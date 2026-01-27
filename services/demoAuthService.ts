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

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

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