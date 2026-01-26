/**
 * Permission Hooks for React Components
 * Provides permission checking functionality for UI components
 */

import { useAuth } from '../../context/AuthContext';
import { UserRole, Permission } from '../../types';
import { PermissionManager, canAccessRoute, RouteName } from '../utils/permissionUtils';

/**
 * Hook to check if current user has specific permission
 */
export function usePermission(permission: Permission): boolean {
  const { user } = useAuth();
  
  if (!user) {
    return false;
  }
  
  return PermissionManager.hasPermission(user.role, permission);
}

/**
 * Hook to check if current user has any of the required permissions
 */
export function useAnyPermission(permissions: Permission[]): boolean {
  const { user } = useAuth();
  
  if (!user) {
    return false;
  }
  
  return PermissionManager.hasAnyPermission(user.role, permissions);
}

/**
 * Hook to check if current user has all required permissions
 */
export function useAllPermissions(permissions: Permission[]): boolean {
  const { user } = useAuth();
  
  if (!user) {
    return false;
  }
  
  return PermissionManager.hasAllPermissions(user.role, permissions);
}

/**
 * Hook to check if current user is admin level
 */
export function useIsAdmin(): boolean {
  const { user } = useAuth();
  
  if (!user) {
    return false;
  }
  
  return PermissionManager.isAdmin(user.role);
}

/**
 * Hook to check if current user is mentor/teacher level
 */
export function useIsMentor(): boolean {
  const { user } = useAuth();
  
  if (!user) {
    return false;
  }
  
  return PermissionManager.isMentor(user.role);
}

/**
 * Hook to check if current user is student
 */
export function useIsStudent(): boolean {
  const { user } = useAuth();
  
  if (!user) {
    return false;
  }
  
  return PermissionManager.isStudent(user.role);
}

/**
 * Hook to check if current user can access specific route
 */
export function useRouteAccess(routeName: RouteName): boolean {
  const { user } = useAuth();
  
  if (!user) {
    return false;
  }
  
  return canAccessRoute(user.role, routeName);
}

/**
 * Hook to get user's allowed actions based on role
 */
export function useUserActions() {
  const { user } = useAuth();
  
  if (!user) {
    return {
      canManageUsers: false,
      canCreateExam: false,
      canGradeOSCE: false,
      canViewAnalytics: false,
      isAdmin: false,
      isMentor: false,
      isStudent: false
    };
  }
  
  return {
    canManageUsers: PermissionManager.canManageUsers(user.role),
    canCreateExam: PermissionManager.canCreateExam(user.role),
    canGradeOSCE: PermissionManager.canGradeOSCE(user.role),
    canViewAnalytics: PermissionManager.canViewAnalytics(user.role),
    isAdmin: PermissionManager.isAdmin(user.role),
    isMentor: PermissionManager.isMentor(user.role),
    isStudent: PermissionManager.isStudent(user.role)
  };
}

/**
 * Hook for conditional rendering based on permissions
 */
export function usePermissionGuard(requiredPermission: Permission) {
  const hasPermission = usePermission(requiredPermission);
  
  return {
    hasPermission,
    // Component that only renders if user has permission
    PermissionGuard: ({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) => {
      return hasPermission ? <>{children}</> : <>{fallback}</>;
    }
  };
}

/**
 * Hook for role-based conditional rendering
 */
export function useRoleGuard(allowedRoles: UserRole[]) {
  const { user } = useAuth();
  
  const hasRole = user ? allowedRoles.includes(user.role) : false;
  
  return {
    hasRole,
    // Component that only renders if user has required role
    RoleGuard: ({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) => {
      return hasRole ? <>{children}</> : <>{fallback}</>;
    }
  };
}

/**
 * Hook for demo account restrictions
 */
export function useDemoRestrictions() {
  const { user } = useAuth();
  
  if (!user || !user.email?.endsWith('@sinaesta.com')) {
    return {
      isDemoAccount: false,
      allowedFeatures: [],
      timeRemaining: null,
      canExtendSession: false
    };
  }
  
  // This would integrate with the demo restrictions logic
  return {
    isDemoAccount: true,
    allowedFeatures: ['EXAM_TAKING', 'FLASHCARDS'], // Placeholder
    timeRemaining: 30 * 60 * 1000, // 30 minutes in ms
    canExtendSession: false
  };
}

/**
 * Hook to safely switch roles (only for legitimate admin operations)
 */
export function useSafeRoleSwitch() {
  const { user, updateUser } = useAuth();
  
  const canSwitchRole = (targetRole: UserRole): boolean => {
    if (!user) return false;
    
    // Only super admin can switch roles
    if (user.role !== UserRole.SUPER_ADMIN) {
      return false;
    }
    
    // Super admin can only switch to equal or lower roles
    const roleHierarchy = {
      [UserRole.SUPER_ADMIN]: 4,
      [UserRole.PROGRAM_ADMIN]: 3,
      [UserRole.TEACHER]: 2,
      [UserRole.REVIEWER]: 1,
      [UserRole.PROCTOR]: 1,
      [UserRole.STUDENT]: 0
    };
    
    return roleHierarchy[user.role] >= roleHierarchy[targetRole];
  };
  
  const switchRole = (targetRole: UserRole): boolean => {
    if (!canSwitchRole(targetRole)) {
      console.warn('Role switch denied: Insufficient permissions or invalid hierarchy');
      return false;
    }
    
    const updatedUser = { ...user, role: targetRole };
    updateUser(updatedUser);
    return true;
  };
  
  const getAllowedRoles = (): UserRole[] => {
    if (!user || user.role !== UserRole.SUPER_ADMIN) {
      return [];
    }
    
    // Super admin can switch to any role
    return Object.values(UserRole);
  };
  
  return {
    canSwitchRole,
    switchRole,
    getAllowedRoles,
    currentRole: user?.role
  };
}