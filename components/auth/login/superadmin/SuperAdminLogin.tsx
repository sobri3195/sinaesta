import React, { useState } from 'react';
import { Crown, Lock, Eye, EyeOff, AlertCircle, X, Globe } from 'lucide-react';

interface SuperAdminLoginProps {
  onLogin: (credentials: { email: string; password: string }) => void;
  onBack: () => void;
  error?: string;
}

const SuperAdminLogin: React.FC<SuperAdminLoginProps> = ({ onLogin, onBack, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-100 to-amber-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-amber-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 p-6 sm:p-8 text-white relative">
          <button
            onClick={onBack}
            className="absolute top-4 left-4 p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex flex-col items-center text-center">
            <div className="bg-white/20 p-3 rounded-full mb-3 animate-pulse">
              <Crown size={32} className="text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">Super Admin Portal</h1>
            <p className="text-sm text-amber-100 mt-1">Akses penuh sistem management</p>
          </div>
        </div>

        {/* Warning Alert */}
        <div className="p-4 bg-amber-50 border-b border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-800">
              <span className="font-semibold">Akses Terbatas:</span> Hanya untuk administrator sistem dengan otorisasi tertinggi.
            </div>
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
                Super Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                  placeholder="superadmin@system.sinaesta.id"
                />
                <Crown size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Master Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pl-11 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
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
              <p className="mt-1 text-xs text-gray-500">Gunakan master password sistem</p>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Globe size={18} className="text-amber-600 flex-shrink-0" />
                <p className="text-xs font-semibold text-amber-800">Hak Akses Global:</p>
              </div>
              <ul className="text-xs text-amber-700 space-y-1 ml-6 list-disc">
                <li>Manajemen semua institusi</li>
                <li>Konfigurasi sistem</li>
                <li>Akses audit & security logs</li>
                <li>Backup & restore database</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-white py-3 rounded-lg font-semibold hover:from-amber-700 hover:via-orange-700 hover:to-amber-700 active:from-amber-800 active:via-orange-800 active:to-amber-800 transition-all shadow-lg hover:shadow-xl"
            >
              Akses Super Admin
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                Mencoba mengakses sebagai admin program?
              </p>
              <button
                onClick={onBack}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                Kembali ke pilihan login →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;