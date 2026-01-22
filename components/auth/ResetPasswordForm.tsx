import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

interface ResetPasswordFormProps {
  token: string;
  onSuccess: () => void;
  onBackToLogin: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token, onSuccess, onBackToLogin }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.resetPassword(token, password);
      setIsSubmitted(true);
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may be invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful</h2>
        <p className="text-gray-600 mb-8">
          Your password has been reset successfully. You will be redirected to the login page shortly.
        </p>
        <button
          onClick={onBackToLogin}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all"
        >
          Login Now
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
        <p className="text-gray-600 mt-2">Create a new, strong password for your account.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !password || !confirmPassword}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
