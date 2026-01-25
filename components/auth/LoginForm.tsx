import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { User, UserRole } from '../../types';

interface DemoAccount {
  id: string;
  label: string;
  description: string;
  user: User;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'demo-student',
    label: 'Mahasiswa PPDS',
    description: 'Akses fitur belajar dan simulasi ujian.',
    user: {
      id: 'demo-student',
      email: 'demo.student@sinaesta.com',
      name: 'Demo Student',
      role: UserRole.STUDENT,
      avatar: 'https://i.pravatar.cc/100?img=32',
      emailVerified: true,
      targetSpecialty: 'Internal Medicine',
    },
  },
  {
    id: 'demo-mentor',
    label: 'Mentor Klinis',
    description: 'Lihat dashboard mentor dan feedback peserta.',
    user: {
      id: 'demo-mentor',
      email: 'demo.mentor@sinaesta.com',
      name: 'Demo Mentor',
      role: UserRole.TEACHER,
      avatar: 'https://i.pravatar.cc/100?img=12',
      emailVerified: true,
    },
  },
  {
    id: 'demo-admin',
    label: 'Admin Program',
    description: 'Kelola konten, cohort, dan analitik.',
    user: {
      id: 'demo-admin',
      email: 'demo.admin@sinaesta.com',
      name: 'Demo Admin',
      role: UserRole.PROGRAM_ADMIN,
      avatar: 'https://i.pravatar.cc/100?img=5',
      emailVerified: true,
    },
  },
];

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
  initialEmail?: string;
  initialPassword?: string;
  autoSubmit?: boolean;
  initialDemoAccountId?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
  onSwitchToForgotPassword,
  initialEmail,
  initialPassword,
  autoSubmit,
  initialDemoAccountId,
}) => {
  const { login, loginDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  const [selectedDemoId, setSelectedDemoId] = useState(
    initialDemoAccountId || DEMO_ACCOUNTS[0].id
  );

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
    const selectedDemo = DEMO_ACCOUNTS.find((account) => account.id === selectedDemoId);
    if (!selectedDemo) {
      setError('Akun demo tidak ditemukan. Silakan pilih akun demo lain.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await loginDemo(selectedDemo.user);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Login demo gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialEmail !== undefined) setEmail(initialEmail);
  }, [initialEmail]);

  useEffect(() => {
    if (initialPassword !== undefined) setPassword(initialPassword);
  }, [initialPassword]);

  useEffect(() => {
    if (!autoSubmit || hasAutoSubmitted) return;
    if (initialDemoAccountId) {
      setHasAutoSubmitted(true);
      void handleDemoLogin();
      return;
    }
    if (!initialEmail || !initialPassword) return;

    setHasAutoSubmitted(true);
    void performLogin({ email: initialEmail, password: initialPassword, rememberMe: false });
  }, [autoSubmit, hasAutoSubmitted, initialDemoAccountId, initialEmail, initialPassword]);

  useEffect(() => {
    if (initialDemoAccountId) {
      setSelectedDemoId(initialDemoAccountId);
    }
  }, [initialDemoAccountId]);

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

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-gray-900">Akun Demo (Bypass)</p>
              <p className="text-xs text-gray-500">Masuk tanpa password dan pilih peran yang diinginkan.</p>
            </div>
          </div>
          <div className="space-y-3">
            {DEMO_ACCOUNTS.map((account) => (
              <label
                key={account.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedDemoId === account.id ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <input
                  type="radio"
                  name="demo-account"
                  value={account.id}
                  checked={selectedDemoId === account.id}
                  onChange={() => setSelectedDemoId(account.id)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{account.label}</p>
                  <p className="text-xs text-gray-500">{account.description}</p>
                </div>
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full mt-4 flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Masuk dengan Akun Demo
          </button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button onClick={onSwitchToRegister} className="font-medium text-blue-600 hover:text-blue-500">
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
