import React, { useState, useEffect } from 'react';
import { demoAuthService } from '../services/demoAuthService';
import { UserRole } from '../types';
import { Server, ServerOff, UserCircle, ShieldCheck, GraduationCap, Users, AlertTriangle, CheckCircle, X, RefreshCw } from 'lucide-react';

interface DemoSettingsProps {
  onClose: () => void;
}

const DEMO_ACCOUNTS = [
  {
    id: 'demo-student',
    name: 'Demo Student',
    email: 'student1@sinaesta.com',
    password: 'admin123',
    role: UserRole.STUDENT,
    description: 'Student account with access to exams, flashcards, and study materials',
  },
  {
    id: 'demo-mentor',
    name: 'Demo Mentor',
    email: 'mentor1@sinaesta.com',
    password: 'admin123',
    role: UserRole.TEACHER,
    description: 'Mentor account with exam creation and student management access',
  },
  {
    id: 'demo-admin',
    name: 'Demo Admin',
    email: 'admin@sinaesta.com',
    password: 'admin123',
    role: UserRole.SUPER_ADMIN,
    description: 'Admin account with full system access and management capabilities',
  },
  {
    id: 'demo-user',
    name: 'Demo User',
    email: 'demo@sinaesta.com',
    password: 'demo123',
    role: UserRole.STUDENT,
    description: 'Basic demo account for quick access to student features',
  },
  {
    id: 'demo-surgery',
    name: 'Surgery Demo',
    email: 'surgery@sinaesta.com',
    password: 'demo123',
    role: UserRole.STUDENT,
    description: 'Demo account focused on Surgery specialty',
  },
  {
    id: 'demo-pediatrics',
    name: 'Pediatrics Demo',
    email: 'pediatrics@sinaesta.com',
    password: 'demo123',
    role: UserRole.STUDENT,
    description: 'Demo account focused on Pediatrics specialty',
  },
  {
    id: 'demo-obgyn',
    name: 'Obgyn Demo',
    email: 'obgyn@sinaesta.com',
    password: 'demo123',
    role: UserRole.STUDENT,
    description: 'Demo account focused on Obstetrics & Gynecology specialty',
  },
  {
    id: 'demo-cardiology',
    name: 'Cardiology Demo',
    email: 'cardiology@sinaesta.com',
    password: 'demo123',
    role: UserRole.STUDENT,
    description: 'Demo account focused on Cardiology specialty',
  },
];

const DemoSettings: React.FC<DemoSettingsProps> = ({ onClose }) => {
  const [isBackendEnabled, setIsBackendEnabled] = useState<boolean>(true);
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState<boolean>(false);

  useEffect(() => {
    setIsBackendEnabled(demoAuthService.isBackendActive());
  }, []);

  const toggleBackend = (enable: boolean) => {
    setIsToggling(true);
    
    setTimeout(() => {
      demoAuthService.setBackendEnabled(enable);
      setIsBackendEnabled(enable);
      setIsToggling(false);
      setShowConfirmation(false);
    }, 500);
  };

  const handleAccountSwitch = (accountId: string) => {
    setSelectedAccount(accountId);
    setIsSwitching(true);
    
    // Simulate account switching
    setTimeout(() => {
      setIsSwitching(false);
      // In a real implementation, you would call the auth service here
      // For demo purposes, we just show the selection
    }, 1000);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.STUDENT:
        return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case UserRole.TEACHER:
        return <Users className="w-4 h-4 text-green-600" />;
      case UserRole.SUPER_ADMIN:
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      default:
        return <UserCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-50 p-4 border-b border-blue-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-blue-800 flex items-center gap-2">
            <UserCircle className="w-6 h-6" />
            Demo Settings & Backend Control
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Backend Control Section */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Server className="w-5 h-5" />
              Backend Control
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {isBackendEnabled ? (
                    <Server className="w-6 h-6 text-green-600" />
                  ) : (
                    <ServerOff className="w-6 h-6 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {isBackendEnabled ? 'Backend Active' : 'Backend Disabled (Demo Mode)'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {isBackendEnabled ? 'All requests go to the real backend' : 'All authentication handled locally'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => isBackendEnabled ? setShowConfirmation(true) : toggleBackend(true)}
                  disabled={isToggling}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${isToggling ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : isBackendEnabled ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                >
                  {isToggling ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Switching...
                    </>
                  ) : isBackendEnabled ? (
                    <>
                      <ServerOff className="w-4 h-4" />
                      Disable Backend
                    </>
                  ) : (
                    <>
                      <Server className="w-4 h-4" />
                      Enable Backend
                    </>
                  )}
                </button>
              </div>
              <div className="bg-blue-50 rounded p-3 text-sm text-blue-700">
                <AlertTriangle className="w-4 h-4 inline-block mr-1" />
                {isBackendEnabled ? (
                  <span>Backend is active. Demo accounts will try real authentication first, then fall back to mock data.</span>
                ) : (
                  <span>Backend is disabled. All authentication is handled locally with mock data. No real API calls will be made.</span>
                )}
              </div>
            </div>
          </div>

          {/* Demo Accounts Section */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserCircle className="w-5 h-5" />
              Demo Accounts
            </h3>
            <div className="space-y-3">
              {DEMO_ACCOUNTS.map((account) => (
                <div
                  key={account.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${selectedAccount === account.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                  onClick={() => handleAccountSwitch(account.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getRoleIcon(account.role)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">{account.name}</h4>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {account.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{account.description}</p>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="truncate max-w-[180px]">{account.email}</span>
                        <span className="font-mono bg-gray-100 px-1 rounded">••••••••</span>
                      </div>
                    </div>
                    {isSwitching && selectedAccount === account.id && (
                      <div className="flex-shrink-0 ml-2">
                        <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Information */}
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
            <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Current Status
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Backend:</span>
                <span className={`font-bold ${isBackendEnabled ? 'text-green-700' : 'text-red-700'}`}>
                  {isBackendEnabled ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Authentication:</span>
                <span className="font-bold text-blue-700">
                  {isBackendEnabled ? 'Real + Demo Fallback' : 'Local Mock Only'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Selected Account:</span>
                <span className="font-bold text-gray-900">
                  {selectedAccount ? DEMO_ACCOUNTS.find(a => a.id === selectedAccount)?.name : 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              // Reset to default state
              demoAuthService.setBackendEnabled(true);
              setIsBackendEnabled(true);
              setSelectedAccount(null);
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Reset to Default
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-red-200 max-w-sm w-full">
            <div className="p-4 border-b border-red-100 bg-red-50 rounded-t-xl">
              <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Disable Backend?
              </h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Disabling the backend will put the system in demo mode. All authentication will be handled locally and some features may be limited.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleBackend(false)}
                  disabled={isToggling}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Confirm Disable
                </button>
                <button
                  onClick={() => setShowConfirmation(false)}
                  disabled={isToggling}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoSettings;