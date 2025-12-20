import React from 'react';

interface LoginSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSelect: (userType: 'student' | 'admin' | 'mentor') => void;
}

const LoginSelectionModal: React.FC<LoginSelectionModalProps> = ({ isOpen, onClose, onLoginSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4 text-center text-gray-900">Select Login Type</h2>
        
        <div className="flex flex-col gap-4">
          <button
            onClick={() => onLoginSelect('student')}
            className="w-full py-4 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-3"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
            Login as Student
          </button>
          
          <button
            onClick={() => onLoginSelect('admin')}
            className="w-full py-4 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-3"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Login as Admin
          </button>
          
          <button
            onClick={() => onLoginSelect('mentor')}
            className="w-full py-4 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-3"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Login as Mentor
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginSelectionModal;