import React from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';

export function ConnectionStatus() {
  const { isConnected, connectionError, reconnect } = useWebSocket();

  if (isConnected) {
    return null; // Don't show anything when connected
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border-2 border-yellow-300 p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {connectionError ? (
              <AlertCircle className="w-6 h-6 text-red-600" />
            ) : (
              <WifiOff className="w-6 h-6 text-yellow-600" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">
              {connectionError ? 'Connection Error' : 'Disconnected'}
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              {connectionError
                ? `Failed to connect: ${connectionError}`
                : 'Real-time features are currently unavailable. Attempting to reconnect...'}
            </p>
            <button
              onClick={reconnect}
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Wifi className="w-4 h-4" />
              Reconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
