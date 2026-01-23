import { useEffect, useState, useCallback } from 'react';
import { socketService } from '../services/socketService';

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  message: string;
  message_type: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  is_read: boolean;
  created_at: string;
}

export interface TypingUser {
  userId: string;
  userName: string;
}

export interface OnlineStatus {
  userId: string;
  userName: string;
  status: 'online' | 'offline' | 'away' | 'busy';
}

export function useChat(roomId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineStatus[]>([]);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    if (!roomId || !socketService.isConnected()) {
      return;
    }

    // Join room
    socketService.joinRoom(roomId);

    // Set up event listeners
    const handleRoomJoined = (data: { roomId: string; messages: ChatMessage[] }) => {
      if (data.roomId === roomId) {
        setMessages(data.messages);
        setIsJoined(true);
      }
    };

    const handleReceiveMessage = (message: ChatMessage) => {
      if (message.room_id === roomId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleTypingIndicator = (data: { roomId: string; userId: string; userName: string; isTyping: boolean }) => {
      if (data.roomId === roomId) {
        if (data.isTyping) {
          setTypingUsers((prev) => {
            if (!prev.find((u) => u.userId === data.userId)) {
              return [...prev, { userId: data.userId, userName: data.userName }];
            }
            return prev;
          });
        } else {
          setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
        }
      }
    };

    const handleUserStatusChange = (data: OnlineStatus) => {
      setOnlineUsers((prev) => {
        const existing = prev.find((u) => u.userId === data.userId);
        if (existing) {
          return prev.map((u) => (u.userId === data.userId ? data : u));
        }
        return [...prev, data];
      });
    };

    const handleMessageRead = (data: { messageId: string; roomId: string; readBy: string }) => {
      if (data.roomId === roomId) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === data.messageId ? { ...msg, is_read: true } : msg))
        );
      }
    };

    socketService.on('room-joined', handleRoomJoined);
    socketService.on('receive-message', handleReceiveMessage);
    socketService.on('typing-indicator', handleTypingIndicator);
    socketService.on('user-status-change', handleUserStatusChange);
    socketService.on('message-read', handleMessageRead);

    // Cleanup
    return () => {
      if (roomId) {
        socketService.leaveRoom(roomId);
      }
      socketService.off('room-joined', handleRoomJoined);
      socketService.off('receive-message', handleReceiveMessage);
      socketService.off('typing-indicator', handleTypingIndicator);
      socketService.off('user-status-change', handleUserStatusChange);
      socketService.off('message-read', handleMessageRead);
      setIsJoined(false);
    };
  }, [roomId]);

  const sendMessage = useCallback(
    (message: string, messageType = 'text', fileUrl?: string, fileName?: string, fileSize?: number) => {
      if (roomId && socketService.isConnected()) {
        socketService.sendMessage(roomId, message, messageType, fileUrl, fileName, fileSize);
      }
    },
    [roomId]
  );

  const sendTypingIndicator = useCallback(
    (isTyping: boolean) => {
      if (roomId && socketService.isConnected()) {
        socketService.sendTypingIndicator(roomId, isTyping);
      }
    },
    [roomId]
  );

  const markAsRead = useCallback((messageId: string) => {
    if (socketService.isConnected()) {
      socketService.markMessageAsRead(messageId);
    }
  }, []);

  return {
    messages,
    typingUsers,
    onlineUsers,
    isJoined,
    sendMessage,
    sendTypingIndicator,
    markAsRead,
  };
}
