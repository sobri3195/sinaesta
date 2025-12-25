import React, { useState } from 'react';
import { UserRole } from '../../types';
import LoginSelectionModal from '../LoginSelectionModal';
import MentorLogin from './login/mentor/MentorLogin';
import AdminLogin from './login/admin/AdminLogin';
import SuperAdminLogin from './login/superadmin/SuperAdminLogin';

interface LoginRouterProps {
  onLoginSuccess: (role: UserRole) => void;
}

type LoginView = 'SELECTION' | 'MENTOR_LOGIN' | 'ADMIN_LOGIN' | 'SUPERADMIN_LOGIN';

const LoginRouter: React.FC<LoginRouterProps> = ({ onLoginSuccess }) => {
  const [currentView, setCurrentView] = useState<LoginView>('SELECTION');
  const [error, setError] = useState<string>('');

  const handleLoginSelect = (userType: 'student' | 'admin' | 'mentor' | 'super_admin') => {
    setError('');
    switch (userType) {
      case 'mentor':
        setCurrentView('MENTOR_LOGIN');
        break;
      case 'admin':
        setCurrentView('ADMIN_LOGIN');
        break;
      case 'super_admin':
        setCurrentView('SUPERADMIN_LOGIN');
        break;
      case 'student':
        onLoginSuccess(UserRole.STUDENT);
        break;
    }
  };

  const handleMentorLogin = (credentials: { email: string; password: string; institution: string }) => {
    // Simulate authentication
    if (credentials.email && credentials.password && credentials.institution) {
      onLoginSuccess(UserRole.TEACHER);
    } else {
      setError('Mohon lengkapi semua field');
    }
  };

  const handleAdminLogin = (credentials: { email: string; password: string; institution: string }) => {
    // Simulate authentication
    if (credentials.email && credentials.password && credentials.institution) {
      onLoginSuccess(UserRole.PROGRAM_ADMIN);
    } else {
      setError('Mohon lengkapi semua field');
    }
  };

  const handleSuperAdminLogin = (credentials: { email: string; password: string }) => {
    // Simulate authentication with stricter validation
    if (credentials.email && credentials.password) {
      onLoginSuccess(UserRole.SUPER_ADMIN);
    } else {
      setError('Mohon lengkapi semua field');
    }
  };

  const handleBack = () => {
    setError('');
    setCurrentView('SELECTION');
  };

  switch (currentView) {
    case 'SELECTION':
      return (
        <LoginSelectionModal
          isOpen={true}
          onClose={() => {}}
          onLoginSelect={handleLoginSelect}
        />
      );
    case 'MENTOR_LOGIN':
      return (
        <MentorLogin
          onLogin={handleMentorLogin}
          onBack={handleBack}
          error={error}
        />
      );
    case 'ADMIN_LOGIN':
      return (
        <AdminLogin
          onLogin={handleAdminLogin}
          onBack={handleBack}
          error={error}
        />
      );
    case 'SUPERADMIN_LOGIN':
      return (
        <SuperAdminLogin
          onLogin={handleSuperAdminLogin}
          onBack={handleBack}
          error={error}
        />
      );
    default:
      return null;
  }
};

export default LoginRouter;