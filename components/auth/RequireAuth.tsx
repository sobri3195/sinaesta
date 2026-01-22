import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallback?: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ 
  children, 
  allowedRoles,
  fallback
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">You must be logged in to view this page.</p>
        {fallback}
      </div>
    );
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Insufficient Permissions</h2>
        <p className="text-gray-600 mb-6">You do not have permission to access this resource.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireAuth;
