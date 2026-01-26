import React from 'react';
import { Database, AlertCircle } from 'lucide-react';

interface BackendToggleProps {
  className?: string;
}

const BackendToggle: React.FC<BackendToggleProps> = ({ className = '' }) => {
  const [backendEnabled, setBackendEnabled] = React.useState(
    localStorage.getItem('backendEnabled') !== 'false'
  );

  const toggleBackend = () => {
    const newValue = !backendEnabled;
    setBackendEnabled(newValue);
    localStorage.setItem('backendEnabled', newValue.toString());

    // Show notification
    if (newValue) {
      console.log('Backend mode enabled - connecting to real server');
    } else {
      console.log('Demo mode enabled - using local storage');
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={toggleBackend}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          backendEnabled
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-orange-50 text-orange-700 border border-orange-200'
        }`}
        title={backendEnabled ? 'Backend connected' : 'Demo mode - using local storage'}
      >
        {backendEnabled ? (
          <>
            <Database className="w-3.5 h-3.5" />
            <span>Backend: ON</span>
          </>
        ) : (
          <>
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Demo Mode</span>
          </>
        )}
      </button>
    </div>
  );
};

export default BackendToggle;
