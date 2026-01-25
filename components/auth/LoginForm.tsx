import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, UserCircle } from 'lucide-react';
import DemoAccountSelector from './DemoAccountSelector';
import BackendToggle from './BackendToggle';

const DEMO_EMAIL = 'demo@sinaesta.com';
const DEMO_PASSWORD = 'demo123';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
  initialEmail?: string;
  initialPassword?: string;
  autoSubmit?: boolean;
  showDemoSelector?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
  onSwitchToForgotPassword,
  initialEmail,
  initialPassword,
  autoSubmit,
  showDemoSelector = true,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const performLogin = async (payload: { email: string; password: string; rememberMe?: boolean }) => {
    if (!payload.email || !payload.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await login(payload);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin({ email, password, rememberMe });
  };

  const handleDemoLogin = async () => {
    setRememberMe(false);
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    await performLogin({ email: DEMO_EMAIL, password: DEMO_PASSWORD, rememberMe: false });
  };

  const handleDemoAccountSelect = async (account: { email: string; password: string; role: string }) => {
    setRememberMe(false);
    setEmail(account.email);
    setPassword(account.password);
    setShowDemoAccounts(false);
    await performLogin({ email: account.email, password: account.password, rememberMe: false });
  };

  useEffect(() => {
    if (initialEmail !== undefined) setEmail(initialEmail);
  }, [initialEmail]);

  useEffect(() => {
    if (initialPassword !== undefined) setPassword(initialPassword);
  }, [initialPassword]);

  useEffect(() => {
    if (!autoSubmit || hasAutoSubmitted) return;
    if (!initialEmail || !initialPassword) return;

    setHasAutoSubmitted(true);
    void performLogin({ email: initialEmail, password: initialPassword, rememberMe: false });
  }, [autoSubmit, hasAutoSubmitted, initialEmail, initialPassword]);

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600 mt-2">Sign in to your account</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
              Remember me
            </label>
          </div>

          <button
            type="button"
            onClick={onSwitchToForgotPassword}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
        </button>

        {showDemoSelector && (
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Masuk dengan Akun Demo
          </button>
        )}

        {showDemoSelector && (
          <button
            type="button"
            onClick={() => setShowDemoAccounts(true)}
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-blue-300 rounded-lg shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-3"
          >
            <UserCircle className="w-4 h-4" />
            Pilih Akun Demo Lainnya
          </button>
        )}
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button onClick={onSwitchToRegister} className="font-medium text-blue-600 hover:text-blue-500">
            Create an account
          </button>
        </p>
      </div>

      {/* Backend Toggle for Demo Mode */}
      <div className="mt-6 flex justify-center">
        <BackendToggle />
      </div>

      {showDemoAccounts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md">
            <DemoAccountSelector
              onSelectAccount={handleDemoAccountSelect}
              onClose={() => setShowDemoAccounts(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
