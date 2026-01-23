import { useEffect, useState, useCallback } from 'react';
import { socketService } from '../services/socketService';
import { useAuthStore } from '../../stores/authStore';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { accessToken, user } = useAuthStore();

  useEffect(() => {
    if (!accessToken) {
      socketService.disconnect();
      setIsConnected(false);
      return;
    }

    // Connect to WebSocket
    const socket = socketService.connect(accessToken);

    // Set up event listeners
    const handleConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleConnectError = (error: Error) => {
      setConnectionError(error.message);
      setIsConnected(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    // Set up heartbeat (every 30 seconds)
    const heartbeatInterval = setInterval(() => {
      if (socketService.isConnected()) {
        socketService.sendHeartbeat();
      }
    }, 30000);

    // Initial connection check
    setIsConnected(socketService.isConnected());

    // Cleanup on unmount
    return () => {
      clearInterval(heartbeatInterval);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, [accessToken]);

  const reconnect = useCallback(() => {
    if (accessToken) {
      socketService.disconnect();
      socketService.connect(accessToken);
    }
  }, [accessToken]);

  return {
    isConnected,
    connectionError,
    reconnect,
    socket: socketService.getSocket(),
  };
}
