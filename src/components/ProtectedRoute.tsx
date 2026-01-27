/**
 * Protected Route Component
 * Ensures users have proper permissions before accessing routes
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, Permission } from '../../types';
import { PermissionManager, canAccessRoute, RouteName, isDemoBypassActive } from '../utils/permissionUtils';
import { demoAuthService } from '../../services/demoAuthService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  routeName?: RouteName;
  fallback?: React.ReactNode;
  showUnauthorizedMessage?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
  allowedRoles,
  routeName,
  fallback = null,
  showUnauthorizedMessage = true
}) => {
  const { user, isAuthenticated } = useAuth();

  // Not authenticated
  if (!isAuthenticated || !user) {
    return showUnauthorizedMessage ? (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    ) : (
      <>{fallback}</>
    );
  }

  // Check if demo bypass mode is active - allow all access
  if (isDemoBypassActive() || demoAuthService.isBypassAllPermissionsActive()) {
    return <>{children}</>;
  }

  // Demo account restrictions
  if (demoAuthService.isDemoAccount(user.email)) {
    const restrictions = demoAuthService.getDemoAccountRestrictions(user.email);
    if (restrictions) {
      // Check role restrictions
      if (requiredRole && !restrictions.allowedRoles.includes(requiredRole)) {
        return showUnauthorizedMessage ? (
          <DemoAccessDenied 
            reason="Role Access Restricted" 
            message={`Your demo account (${user.email}) is restricted to: ${restrictions.allowedRoles.join(', ')}`}
          />
        ) : (
          <>{fallback}</>
        );
      }

      // Check specific role permissions
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        return showUnauthorizedMessage ? (
          <DemoAccessDenied 
            reason="Role Access Restricted" 
            message={`Your demo account (${user.email}) does not have access to this feature.`}
          />
        ) : (
          <>{fallback}</>
        );
      }

      // Check permission requirements
      if (requiredPermission && !PermissionManager.hasPermission(user.role, requiredPermission)) {
        return showUnauthorizedMessage ? (
          <DemoAccessDenied 
            reason="Permission Denied" 
            message={`Your demo account (${user.email}) does not have the required permission: ${requiredPermission}`}
          />
        ) : (
          <>{fallback}</>
        );
      }

      // Check route access
      if (routeName && !canAccessRoute(user.role, routeName)) {
        return showUnauthorizedMessage ? (
          <DemoAccessDenied 
            reason="Route Access Denied" 
            message={`Your demo account (${user.email}) does not have access to this route.`}
          />
        ) : (
          <>{fallback}</>
        );
      }
    }
  } else {
    // Real user permissions
    // Check role requirement
    if (requiredRole && user.role !== requiredRole) {
      return showUnauthorizedMessage ? (
        <AccessDenied 
          reason="Insufficient Role" 
          message={`This feature requires ${requiredRole} role. Your current role is ${user.role}.`}
        />
      ) : (
        <>{fallback}</>
      );
    }

    // Check allowed roles
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return showUnauthorizedMessage ? (
        <AccessDenied 
          reason="Role Not Allowed" 
          message={`This feature requires one of: ${allowedRoles.join(', ')}. Your current role is ${user.role}.`}
        />
      ) : (
        <>{fallback}</>
      );
    }

    // Check permission requirement
    if (requiredPermission && !PermissionManager.hasPermission(user.role, requiredPermission)) {
      return showUnauthorizedMessage ? (
        <AccessDenied 
          reason="Permission Denied" 
          message={`This feature requires ${requiredPermission} permission. Your current permissions do not include this.`}
        />
      ) : (
        <>{fallback}</>
      );
    }

    // Check route access
    if (routeName && !canAccessRoute(user.role, routeName)) {
      return showUnauthorizedMessage ? (
        <AccessDenied 
          reason="Route Access Denied" 
          message={`You do not have permission to access this route.`}
        />
      ) : (
        <>{fallback}</>
      );
    }
  }

  // User has required permissions/roles
  return <>{children}</>;
};

/**
 * Component for displaying access denied messages for demo accounts
 */
const DemoAccessDenied: React.FC<{ reason: string; message: string }> = ({ reason, message }) => {
  const { user } = useAuth();

  const isDemoAdmin = user?.email?.toLowerCase() === 'admin@sinaesta.com';

  const openDemoSettings = () => {
    // App.tsx opens demo settings modal; we can trigger via a custom event
    window.dispatchEvent(new CustomEvent('openDemoSettings'));
  };

  const enableOverride = () => {
    if (!isDemoAdmin) return;
    localStorage.setItem('demo_bypass_mode', 'true');
    localStorage.setItem('demo_bypass_permissions', 'true');
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Demo Access Restricted</h2>
          <p className="text-sm text-gray-500 mb-2">{reason}</p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
            Demo Mode Active
            {isDemoBypassActive() && <span className="text-green-700">(Bypass ON)</span>}
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-orange-800">{message}</p>
          <p className="text-xs text-orange-700 mt-2">
            Tips: buka <button onClick={openDemoSettings} className="underline font-medium">Demo Settings</button> untuk mengubah mode demo / bypass permission.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-gray-500 text-center">
            Logged in as: <span className="font-medium">{user?.email}</span>
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Reload
            </button>
            <button
              onClick={() => window.history.back()}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
          </div>

          {isDemoAdmin && (
            <button
              onClick={enableOverride}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              Override Permission (Demo Admin)
            </button>
          )}

          <button
            onClick={openDemoSettings}
            className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Open Demo Settings
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            Jika ini terjadi saat demo, gunakan "Bypass All Permissions" di Demo Settings (khusus demo).
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Component for displaying access denied messages for regular users
 */
const AccessDenied: React.FC<{ reason: string; message: string }> = ({ reason, message }) => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-sm text-gray-500 mb-4">{reason}</p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-800">{message}</p>
        </div>
        
        <div className="space-y-3">
          <p className="text-xs text-gray-500 text-center">
            Logged in as: <span className="font-medium">{user?.name} ({user?.role})</span>
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => window.history.back()}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Hook for permission-based conditional rendering
 */
export function useRouteGuard(requiredPermission?: Permission, requiredRole?: UserRole) {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) {
    return false;
  }
  
  // Demo account checks
  if (demoAuthService.isDemoAccount(user.email)) {
    const restrictions = demoAuthService.getDemoAccountRestrictions(user.email);
    if (restrictions) {
      if (requiredRole && !restrictions.allowedRoles.includes(requiredRole)) {
        return false;
      }
      if (requiredPermission && !PermissionManager.hasPermission(user.role, requiredPermission)) {
        return false;
      }
    }
  } else {
    // Regular user checks
    if (requiredRole && user.role !== requiredRole) {
      return false;
    }
    if (requiredPermission && !PermissionManager.hasPermission(user.role, requiredPermission)) {
      return false;
    }
  }
  
  return true;
}