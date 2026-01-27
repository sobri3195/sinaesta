import React, { useState, useEffect } from 'react';
import { demoAuthService } from '../services/demoAuthService';
import { Info, Database, FileText, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface DemoDBStats {
  results: number;
  exams: number;
  flashcards: number;
  decks: number;
  osceStations: number;
  osceAttempts: number;
  totalSize: number;
}

const DemoModeIndicator: React.FC<{ minimal?: boolean }> = ({ minimal = false }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState<DemoDBStats | null>(null);
  const [endpoints, setEndpoints] = useState<string[]>([]);

  useEffect(() => {
    updateStatus();
    
    // Update every 5 seconds
    const interval = setInterval(updateStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = () => {
    setIsDemoMode(!demoAuthService.isBackendActive());
    setStats(demoAuthService.getDemoDBStats());
    setEndpoints(demoAuthService.getImplementedEndpoints());
  };

  const handleClearDatabase = () => {
    if (confirm('Clear all demo data? This cannot be undone.')) {
      demoAuthService.clearDemoDatabase();
      updateStatus();
      alert('Demo database cleared successfully!');
    }
  };

  const handleViewDocs = () => {
    demoAuthService.getAPIDocumentation();
    alert('API Documentation has been printed to the console. Check the browser console (F12) to view it.');
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!isDemoMode) return null;

  if (minimal) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 px-3 py-2 bg-yellow-500 text-white rounded-lg shadow-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
        >
          <AlertCircle size={16} />
          Demo Mode
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-xl border-2 border-yellow-500 overflow-hidden" style={{ maxWidth: '400px' }}>
        {/* Header */}
        <div className="bg-yellow-500 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} />
            <span className="font-bold">Demo Mode Active</span>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-white hover:bg-yellow-600 rounded p-1"
          >
            {showDetails ? '−' : '+'}
          </button>
        </div>

        {/* Content */}
        {showDetails && (
          <div className="p-4 space-y-4">
            {/* Status */}
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Mock API is handling all requests</p>
                <p className="text-gray-600 text-xs mt-1">
                  Backend server not required
                </p>
              </div>
            </div>

            {/* Database Stats */}
            {stats && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Database size={16} className="text-gray-600" />
                  <span className="font-medium text-sm">Local Database</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Results:</span>
                    <span className="font-medium">{stats.results}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Exams:</span>
                    <span className="font-medium">{stats.exams}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Flashcards:</span>
                    <span className="font-medium">{stats.flashcards}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">OSCE:</span>
                    <span className="font-medium">{stats.osceAttempts}</span>
                  </div>
                  <div className="col-span-2 flex justify-between pt-1 border-t border-gray-200">
                    <span className="text-gray-600">Total Size:</span>
                    <span className="font-medium">{formatBytes(stats.totalSize)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Endpoints Info */}
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Info size={16} className="text-blue-600" />
                <span className="font-medium text-sm">API Endpoints</span>
              </div>
              <p className="text-xs text-gray-600">
                {endpoints.length} endpoints implemented
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleViewDocs}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
              >
                <FileText size={14} />
                Docs
              </button>
              <button
                onClick={handleClearDatabase}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
              >
                <RefreshCw size={14} />
                Clear
              </button>
            </div>

            {/* Help Text */}
            <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
              <p>💡 All data is stored locally in your browser.</p>
              <p className="mt-1">
                Open console and run{' '}
                <code className="bg-gray-100 px-1 rounded">demoAuthService.getAPIDocumentation()</code>
                {' '}for full API docs.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoModeIndicator;
