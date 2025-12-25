import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, AlertCircle, X, Building2 } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (credentials: { email: string; password: string; institution: string }) => void;
  onBack: () => void;
  error?: string;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onBack, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ email, password, institution });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 sm:p-8 text-white relative">
          <button
            onClick={onBack}
            className="absolute top-4 left-4 p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex flex-col items-center text-center">
            <div className="bg-white/20 p-3 rounded-full mb-3">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">Program Admin Portal</h1>
            <p className="text-sm text-green-100 mt-1">Masuk untuk mengelola program</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Admin
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                  placeholder="admin@universitas.ac.id"
                />
                <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pl-11 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                  placeholder="••••••••"
                />
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kode Institusi
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  required
                  className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                  placeholder="UNIV001"
                />
                <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <p className="mt-1 text-xs text-gray-500">Kode institusi program Anda</p>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 active:from-green-800 active:to-emerald-800 transition-all shadow-lg hover:shadow-xl"
            >
              Masuk sebagai Admin Program
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                Butuh bantuan akses?
              </p>
              <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                Hubungi super admin →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;