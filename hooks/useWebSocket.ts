import { useEffect } from 'react';

// Lightweight compatibility hook.
// The real-time system is implemented under src/, but App.tsx expects this hook.
export function useWebSocket() {
  useEffect(() => {
    // No-op: keeping the connection layer optional for environments without Socket.IO.
  }, []);

  return {
    isConnected: false,
    connectionError: null as string | null,
    reconnect: () => {},
    socket: null as any,
  };
}
