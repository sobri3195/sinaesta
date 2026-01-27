import React, { useState, useEffect } from 'react';
import { demoAuthService } from '../services/demoAuthService';
import { useAuth } from '../context/AuthContext';
import { Timer, AlertTriangle, Zap } from 'lucide-react';

const DemoSessionTimer: React.FC = () => {
  const { user, logout } = useAuth();
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [showWarning, setShowWarning] = useState<boolean>(false);

  useEffect(() => {
    if (!user || !demoAuthService.isDemoAccount(user.email)) return;

    const updateTimer = () => {
      const remaining = demoAuthService.getRemainingSessionTime(user.email);
      setRemainingTime(remaining);

      // Warning 5 minutes before session ends
      if (remaining > 0 && remaining <= 5 * 60 * 1000 && !showWarning) {
        setShowWarning(true);
      }

      // Logout when session ends
      if (remaining <= 0 && user) {
        logout();
        alert('Demo session expired. Please log in again.');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [user, logout, showWarning]);

  if (!user || !demoAuthService.isDemoAccount(user.email) || remainingTime <= 0) {
    return null;
  }

  const minutes = Math.floor(remainingTime / 60000);
  const seconds = Math.floor((remainingTime % 60000) / 1000);

  const isCritical = remainingTime <= 5 * 60 * 1000;

  return (
    <>
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${isCritical ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-100 text-blue-700'}`}>
        <Timer size={14} />
        <span>Demo Session: {minutes}:{seconds.toString().padStart(2, '0')}</span>
      </div>

      {showWarning && (
        <div className="fixed bottom-4 right-4 z-[100] max-w-sm bg-white border-l-4 border-amber-500 shadow-xl rounded-lg p-4 animate-in slide-in-from-right-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-500 shrink-0" size={20} />
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Session Almost Expired!</h4>
              <p className="text-xs text-gray-600 mt-1">Your demo session will end in {minutes} minutes. Please save any progress.</p>
              <div className="mt-3 flex gap-2">
                <button 
                  onClick={() => setShowWarning(false)}
                  className="text-xs font-medium text-gray-500 hover:text-gray-700"
                >
                  Dismiss
                </button>
                {user.role === 'SUPER_ADMIN' && (
                  <button 
                    onClick={() => {
                      demoAuthService.extendSession(user.email);
                      setShowWarning(false);
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Zap size={12} /> Extend Session
                  </button>
                )}
              </div>
            </div>
            <button onClick={() => setShowWarning(false)} className="text-gray-400 hover:text-gray-600">
              <span className="sr-only">Close</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DemoSessionTimer;
