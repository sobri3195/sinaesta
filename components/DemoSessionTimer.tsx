import React, { useState, useEffect } from 'react';
import { demoAuthService } from '../services/demoAuthService';
import { useAuth } from '../context/AuthContext';
import { Timer, AlertTriangle, Zap, RefreshCw } from 'lucide-react';

interface DemoSessionTimerProps {
  variant?: 'compact' | 'large';
}

const DemoSessionTimer: React.FC<DemoSessionTimerProps> = ({ variant = 'compact' }) => {
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
        // Double check if it's really expired to avoid false positives on lag
        const doubleCheck = demoAuthService.getRemainingSessionTime(user.email);
        if (doubleCheck <= 0) {
          logout();
          alert('Demo session expired. Please log in again.');
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [user, logout, showWarning]);

  if (!user || !demoAuthService.isDemoAccount(user.email)) {
    return null;
  }

  const minutes = Math.floor(remainingTime / 60000);
  const seconds = Math.floor((remainingTime % 60000) / 1000);
  const isCritical = remainingTime <= 5 * 60 * 1000;

  if (variant === 'large') {
    return (
      <div className={`p-6 rounded-xl border-2 transition-all ${isCritical ? 'bg-red-50 border-red-200 animate-pulse' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${isCritical ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
              <Timer size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Demo Session</h3>
              <p className="text-sm text-gray-500">Remaining time for this session</p>
            </div>
          </div>
          <div className={`text-3xl font-mono font-black ${isCritical ? 'text-red-600' : 'text-blue-600'}`}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to reset your session? You will be logged out.')) {
                demoAuthService.resetSession(user.email);
                logout();
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} /> Reset Session
          </button>
          
          {(user.role === 'SUPER_ADMIN' || user.role === 'PROGRAM_ADMIN') && (
            <button 
              onClick={() => {
                demoAuthService.extendSession(user.email, 30 * 60 * 1000);
                alert('Session extended by 30 minutes.');
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
            >
              <Zap size={16} /> Extend Session
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${isCritical ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-100 text-blue-700'}`}>
        <Timer size={14} />
        <span>Demo: {minutes}:{seconds.toString().padStart(2, '0')}</span>
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
                {(user.role === 'SUPER_ADMIN' || user.role === 'PROGRAM_ADMIN') && (
                  <button 
                    onClick={() => {
                      demoAuthService.extendSession(user.email);
                      setShowWarning(false);
                      alert('Session extended.');
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
