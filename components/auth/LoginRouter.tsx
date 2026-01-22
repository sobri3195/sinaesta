import React, { useState, useEffect } from 'react';
import { UserRole } from '../../types';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import ResetPasswordForm from './ResetPasswordForm';
import VerifyEmail from './VerifyEmail';

interface AuthRouterProps {
  onLoginSuccess: () => void;
}

type AuthView = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD' | 'VERIFY_EMAIL';

const AuthRouter: React.FC<AuthRouterProps> = ({ onLoginSuccess }) => {
  const [currentView, setCurrentView] = useState<AuthView>('LOGIN');
  const [token, setToken] = useState<string | null>(null);

  // Handle URL parameters for reset password and verify email
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');
    const path = window.location.pathname;

    if (path === '/reset-password' && resetToken) {
      setToken(resetToken);
      setCurrentView('RESET_PASSWORD');
    } else if (path === '/verify-email' && resetToken) {
      setToken(resetToken);
      setCurrentView('VERIFY_EMAIL');
    }
  }, []);

  const handleSwitchToRegister = () => setCurrentView('REGISTER');
  const handleSwitchToLogin = () => setCurrentView('LOGIN');
  const handleSwitchToForgotPassword = () => setCurrentView('FORGOT_PASSWORD');

  const renderView = () => {
    switch (currentView) {
      case 'LOGIN':
        return (
          <LoginForm
            onSuccess={onLoginSuccess}
            onSwitchToRegister={handleSwitchToRegister}
            onSwitchToForgotPassword={handleSwitchToForgotPassword}
          />
        );
      case 'REGISTER':
        return (
          <RegisterForm
            onSuccess={onLoginSuccess}
            onSwitchToLogin={handleSwitchToLogin}
          />
        );
      case 'FORGOT_PASSWORD':
        return (
          <ForgotPasswordForm
            onBackToLogin={handleSwitchToLogin}
          />
        );
      case 'RESET_PASSWORD':
        return (
          <ResetPasswordForm
            token={token || ''}
            onSuccess={handleSwitchToLogin}
            onBackToLogin={handleSwitchToLogin}
          />
        );
      case 'VERIFY_EMAIL':
        return (
          <VerifyEmail
            token={token || ''}
            onSuccess={onLoginSuccess}
            onBackToLogin={handleSwitchToLogin}
          />
        );
      default:
        return (
          <LoginForm
            onSuccess={onLoginSuccess}
            onSwitchToRegister={handleSwitchToRegister}
            onSwitchToForgotPassword={handleSwitchToForgotPassword}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">S</div>
            <span className="text-2xl font-black text-gray-900 tracking-tight">SINAESTA</span>
          </div>
        </div>
      </div>
      {renderView()}
    </div>
  );
};

export default AuthRouter;
