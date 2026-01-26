/**
 * Permission System Utilities
 * Handles authorization checks across the application
 */

import { UserRole, Permission } from '../../types';

/**
 * Role-based permissions mapping
 * Defines what each role can access
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: ['MANAGE_USERS', 'CREATE_EXAM', 'GRADE_OSCE', 'VIEW_ANALYTICS'],
  [UserRole.PROGRAM_ADMIN]: ['MANAGE_USERS', 'CREATE_EXAM', 'VIEW_ANALYTICS'],
  [UserRole.TEACHER]: ['CREATE_EXAM', 'GRADE_OSCE', 'VIEW_ANALYTICS'],
  [UserRole.REVIEWER]: ['GRADE_OSCE'],
  [UserRole.PROCTOR]: [],
  [UserRole.STUDENT]: []
};

/**
 * Permission-based access control
 */
export class PermissionManager {
  /**
   * Check if user has specific permission
   */
  static hasPermission(userRole: UserRole, permission: Permission): boolean {
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
    return rolePermissions.includes(permission);
  }

  /**
   * Check if user has any of the required permissions
   */
  static hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(userRole, permission));
  }

  /**
   * Check if user has all required permissions
   */
  static hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(userRole, permission));
  }

  /**
   * Check if user role is admin level
   */
  static isAdmin(userRole: UserRole): boolean {
    return [UserRole.SUPER_ADMIN, UserRole.PROGRAM_ADMIN].includes(userRole);
  }

  /**
   * Check if user role is mentor/teacher level
   */
  static isMentor(userRole: UserRole): boolean {
    return [UserRole.TEACHER, UserRole.PROGRAM_ADMIN].includes(userRole);
  }

  /**
   * Check if user is student
   */
  static isStudent(userRole: UserRole): boolean {
    return userRole === UserRole.STUDENT;
  }

  /**
   * Check if user can manage users
   */
  static canManageUsers(userRole: UserRole): boolean {
    return this.hasPermission(userRole, 'MANAGE_USERS');
  }

  /**
   * Check if user can create exams
   */
  static canCreateExam(userRole: UserRole): boolean {
    return this.hasPermission(userRole, 'CREATE_EXAM');
  }

  /**
   * Check if user can grade OSCE
   */
  static canGradeOSCE(userRole: UserRole): boolean {
    return this.hasPermission(userRole, 'GRADE_OSCE');
  }

  /**
   * Check if user can view analytics
   */
  static canViewAnalytics(userRole: UserRole): boolean {
    return this.hasPermission(userRole, 'VIEW_ANALYTICS');
  }
}

/**
 * Route permission mapping
 * Maps routes to required permissions
 */
export const ROUTE_PERMISSIONS = {
  ADMIN_DASHBOARD: ['CREATE_EXAM'],
  USER_MANAGEMENT: ['MANAGE_USERS'],
  COHORT_MANAGEMENT: ['MANAGE_USERS'],
  CREATE_EXAM: ['CREATE_EXAM'],
  VIGNETTE_BUILDER: ['CREATE_EXAM'],
  QUESTION_REVIEW: ['GRADE_OSCE'],
  OSCE_MANAGER: ['GRADE_OSCE'],
  MENTOR_DASHBOARD: ['CREATE_EXAM', 'GRADE_OSCE'],
  BLUEPRINT_MANAGER: ['MANAGE_USERS'],
  KNOWLEDGE_BASE: ['CREATE_EXAM'],
  HIGH_YIELD_MAP: ['VIEW_ANALYTICS'],
  QUESTION_QUALITY: ['VIEW_ANALYTICS'],
  ANALYTICS_DASHBOARD: ['VIEW_ANALYTICS'],
  ADMIN_POSTS: ['MANAGE_USERS'],
  FILE_MANAGER: ['MANAGE_USERS']
} as const;

export type RouteName = keyof typeof ROUTE_PERMISSIONS;

/**
 * Check if user can access specific route
 */
export function canAccessRoute(userRole: UserRole, routeName: RouteName): boolean {
  const requiredPermissions = ROUTE_PERMISSIONS[routeName];
  
  if (!requiredPermissions) {
    // Route doesn't require specific permissions, allow access based on role type
    return true;
  }
  
  return PermissionManager.hasAnyPermission(userRole, requiredPermissions);
}

/**
 * Safe role switcher - only for legitimate admin operations
 */
export class SafeRoleManager {
  /**
   * Check if role switching is allowed for this user and target role
   */
  static canSwitchRole(currentUserRole: UserRole, targetRole: UserRole): boolean {
    // Only super admin can switch roles
    if (currentUserRole !== UserRole.SUPER_ADMIN) {
      return false;
    }
    
    // Super admin can switch to any role
    if (targetRole === UserRole.SUPER_ADMIN) {
      return true;
    }
    
    // Super admin can switch to lower roles
    const roleHierarchy = {
      [UserRole.SUPER_ADMIN]: 4,
      [UserRole.PROGRAM_ADMIN]: 3,
      [UserRole.TEACHER]: 2,
      [UserRole.REVIEWER]: 1,
      [UserRole.PROCTOR]: 1,
      [UserRole.STUDENT]: 0
    };
    
    return roleHierarchy[currentUserRole] > roleHierarchy[targetRole];
  }

  /**
   * Get allowed role switches for current user
   */
  static getAllowedRoleSwitches(currentUserRole: UserRole): UserRole[] {
    if (currentUserRole !== UserRole.SUPER_ADMIN) {
      return []; // Only super admin can switch roles
    }
    
    return Object.values(UserRole); // Super admin can switch to any role
  }
}

/**
 * Security logging for permission violations
 */
export class SecurityLogger {
  static logPermissionViolation(
    userId: string, 
    userEmail: string, 
    userRole: UserRole, 
    action: string, 
    resource: string,
    details?: string
  ) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId,
      userEmail,
      userRole,
      action,
      resource,
      details,
      severity: 'WARNING',
      type: 'PERMISSION_VIOLATION'
    };
    
    // In production, this should send to a security logging service
    console.warn('SECURITY VIOLATION:', logEntry);
    
    // Store in localStorage for demo purposes (remove in production)
    const violations = JSON.parse(localStorage.getItem('security_violations') || '[]');
    violations.push(logEntry);
    localStorage.setItem('security_violations', JSON.stringify(violations));
  }
}

/**
 * Demo account restrictions
 */
export const DEMO_ACCOUNT_RESTRICTIONS = {
  // Demo students can only access student features
  'demo@sinaesta.com': {
    allowedRoles: [UserRole.STUDENT],
    maxSessionDuration: 30 * 60 * 1000, // 30 minutes
    features: ['EXAM_TAKING', 'FLASHCARDS', 'MICROLEARNING']
  },
  'student1@sinaesta.com': {
    allowedRoles: [UserRole.STUDENT],
    maxSessionDuration: 60 * 60 * 1000, // 1 hour
    features: ['EXAM_TAKING', 'FLASHCARDS', 'MICROLEARNING', 'OSCE_PRACTICE']
  },
  'mentor1@sinaesta.com': {
    allowedRoles: [UserRole.TEACHER],
    maxSessionDuration: 120 * 60 * 1000, // 2 hours
    features: ['EXAM_CREATION', 'OSCE_GRADING', 'MENTORING']
  },
  'admin@sinaesta.com': {
    allowedRoles: [UserRole.SUPER_ADMIN],
    maxSessionDuration: 240 * 60 * 1000, // 4 hours
    features: ['ALL_ADMIN_FEATURES']
  }
} as const;

/**
 * Check if demo account is allowed to access specific feature
 */
export function isDemoAccountAllowed(
  email: string, 
  requestedRole: UserRole, 
  requestedFeature?: string
): boolean {
  const restrictions = DEMO_ACCOUNT_RESTRICTIONS[email as keyof typeof DEMO_ACCOUNT_RESTRICTIONS];
  
  if (!restrictions) {
    // Unknown demo account, deny access
    return false;
  }
  
  // Check if requested role is allowed
  if (!restrictions.allowedRoles.includes(requestedRole)) {
    SecurityLogger.logPermissionViolation(
      'demo-user', 
      email, 
      requestedRole, 
      'ROLE_SWITCH_ATTEMPT', 
      'DEMO_ACCOUNT',
      `Requested role ${requestedRole} not in allowed roles: ${restrictions.allowedRoles.join(', ')}`
    );
    return false;
  }
  
  // Check if specific feature is allowed
  if (requestedFeature && !restrictions.features.includes(requestedFeature)) {
    SecurityLogger.logPermissionViolation(
      'demo-user', 
      email, 
      requestedRole, 
      'FEATURE_ACCESS_ATTEMPT', 
      'DEMO_ACCOUNT',
      `Requested feature ${requestedFeature} not allowed`
    );
    return false;
  }
  
  return true;
}