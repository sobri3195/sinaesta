import React, { useState, useEffect } from 'react';
import { demoAuthService } from '../../services/demoAuthService';
import { Server, ServerOff, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';

interface BackendToggleProps {
  className?: string;
}

const BackendToggle: React.FC<BackendToggleProps> = ({ className = '' }) => {
  const [isBackendEnabled, setIsBackendEnabled] = useState<boolean>(true);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [isToggling, setIsToggling] = useState<boolean>(false);

  useEffect(() => {
    // Initialize from localStorage
    setIsBackendEnabled(demoAuthService.isBackendActive());
  }, []);

  const handleToggle = () => {
    if (isBackendEnabled) {
      // Show confirmation when disabling backend
      setShowConfirmation(true);
    } else {
      // Enable backend immediately
      toggleBackend(true);
    }
  };

  const toggleBackend = (enable: boolean) => {
    setIsToggling(true);
    
    setTimeout(() => {
      demoAuthService.setBackendEnabled(enable);
      setIsBackendEnabled(enable);
      setIsToggling(false);
      setShowConfirmation(false);
    }, 500);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
          isBackendEnabled
            ? 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100'
            : 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isToggling ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        ) : isBackendEnabled ? (
          <Server className="w-4 h-4" />
        ) : (
          <ServerOff className="w-4 h-4" />
        )}
        <span>
          {isBackendEnabled ? 'Backend Active' : 'Backend Disabled (Demo Mode)'}
        </span>
      </button>

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

      {/* Status indicator */}
      {!isBackendEnabled && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
          <ServerOff className="w-3 h-3" />
          <span>DEMO</span>
        </div>
      )}
    </div>
  );
};

export default BackendToggle;