import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { ChevronDown, ChevronUp, UserCircle, ShieldCheck, GraduationCap, ChalkboardTeacher } from 'lucide-react';

interface DemoAccountSelectorProps {
  onSelectAccount: (account: { email: string; password: string; role: UserRole }) => void;
  onClose: () => void;
}

const DEMO_ACCOUNTS: Array<{
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'demo-student',
    name: 'Demo Student',
    email: 'student1@sinaesta.com',
    password: 'admin123',
    role: UserRole.STUDENT,
    description: 'Student account with access to exams, flashcards, and study materials',
    icon: <GraduationCap className="w-5 h-5 text-blue-600" />,
  },
  {
    id: 'demo-mentor',
    name: 'Demo Mentor',
    email: 'mentor1@sinaesta.com',
    password: 'admin123',
    role: UserRole.TEACHER,
    description: 'Mentor account with exam creation and student management access',
    icon: <ChalkboardTeacher className="w-5 h-5 text-green-600" />,
  },
  {
    id: 'demo-admin',
    name: 'Demo Admin',
    email: 'admin@sinaesta.com',
    password: 'admin123',
    role: UserRole.SUPER_ADMIN,
    description: 'Admin account with full system access and management capabilities',
    icon: <ShieldCheck className="w-5 h-5 text-purple-600" />,
  },
  {
    id: 'demo-user',
    name: 'Demo User',
    email: 'demo@sinaesta.com',
    password: 'demo123',
    role: UserRole.STUDENT,
    description: 'Basic demo account for quick access to student features',
    icon: <UserCircle className="w-5 h-5 text-gray-600" />,
  },
];

const DemoAccountSelector: React.FC<DemoAccountSelectorProps> = ({ onSelectAccount, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const handleAccountSelect = (account: any) => {
    setSelectedAccount(account.id);
    setTimeout(() => {
      onSelectAccount({
        email: account.email,
        password: account.password,
        role: account.role,
      });
    }, 300);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
      <div className="bg-blue-50 p-4 border-b border-blue-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2">
            <UserCircle className="w-5 h-5" />
            Demo Accounts
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-sm text-blue-600 mt-1">Select a demo account to bypass authentication</p>
      </div>

      {isExpanded && (
        <div className="p-4 max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {DEMO_ACCOUNTS.map((account) => (
              <div
                key={account.id}
                className={`p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                  selectedAccount === account.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => handleAccountSelect(account)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {account.icon}
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
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setIsExpanded(false)}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Collapse
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoAccountSelector;