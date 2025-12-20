import React from 'react';
import { Student, ShieldCheck, UserCircle, Crown, X } from 'lucide-react';

interface LoginSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSelect: (userType: 'student' | 'admin' | 'mentor' | 'super_admin') => void;
}

const LoginSelectionModal: React.FC<LoginSelectionModalProps> = ({ isOpen, onClose, onLoginSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Pilih Level Akses</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">Silakan pilih role Anda untuk masuk ke dalam sistem:</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => onLoginSelect('student')}
            className="w-full p-5 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all flex flex-col items-center gap-3 group"
          >
            <Student className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <h3 className="font-bold text-gray-900 text-sm">Student</h3>
              <p className="text-xs text-gray-500 mt-1">Akses belajar & simulasi</p>
            </div>
          </button>
          
          <button
            onClick={() => onLoginSelect('mentor')}
            className="w-full p-5 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all flex flex-col items-center gap-3 group"
          >
            <UserCircle className="w-8 h-8 text-purple-600 group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <h3 className="font-bold text-gray-900 text-sm">Mentor/Teacher</h3>
              <p className="text-xs text-gray-500 mt-1">Mengajar & review logbook</p>
            </div>
          </button>
          
          <button
            onClick={() => onLoginSelect('admin')}
            className="w-full p-5 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl hover:from-green-100 hover:to-green-200 transition-all flex flex-col items-center gap-3 group"
          >
            <ShieldCheck className="w-8 h-8 text-green-600 group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <h3 className="font-bold text-gray-900 text-sm">Program Admin</h3>
              <p className="text-xs text-gray-500 mt-1">Kelola program & user</p>
            </div>
          </button>
          
          <button
            onClick={() => onLoginSelect('super_admin')}
            className="w-full p-5 bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl hover:from-amber-100 hover:to-amber-200 transition-all flex flex-col items-center gap-3 group"
          >
            <Crown className="w-8 h-8 text-amber-600 group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <h3 className="font-bold text-gray-900 text-sm">Super Admin</h3>
              <p className="text-xs text-gray-500 mt-1">Akses penuh sistem</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginSelectionModal;