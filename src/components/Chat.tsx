import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, X, Users } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { useAuthStore } from '../../stores/authStore';

interface ChatProps {
  roomId: string;
  roomName?: string;
  onClose?: () => void;
}

export function Chat({ roomId, roomName = 'Chat', onClose }: ChatProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuthStore();

  const {
    messages,
    typingUsers,
    onlineUsers,
    isJoined,
    sendMessage: sendChatMessage,
    sendTypingIndicator,
    markAsRead,
  } = useChat(roomId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when they appear
  useEffect(() => {
    const unreadMessages = messages.filter((msg) => !msg.is_read && msg.sender_id !== user?.id);
    unreadMessages.forEach((msg) => markAsRead(msg.id));
  }, [messages, markAsRead, user]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendChatMessage(message.trim());
    setMessage('');
    setIsTyping(false);
    sendTypingIndicator(false);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    // Send typing indicator
    if (!isTyping && e.target.value) {
      setIsTyping(true);
      sendTypingIndicator(true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(false);
    }, 2000);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!isJoined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-900">{roomName}</h3>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{onlineUsers.filter((u) => u.status === 'online').length}</span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isOwnMessage = msg.sender_id === user?.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex gap-2 max-w-[70%] ${
                  isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                {!isOwnMessage && (
                  <div className="flex-shrink-0">
                    {msg.sender_avatar ? (
                      <img
                        src={msg.sender_avatar}
                        alt={msg.sender_name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                        {msg.sender_name[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                )}

                {/* Message bubble */}
                <div className="flex flex-col">
                  {!isOwnMessage && (
                    <span className="text-xs text-gray-600 mb-1">{msg.sender_name}</span>
                  )}
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                    {msg.file_url && (
                      <a
                        href={msg.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 mt-2 text-sm underline"
                      >
                        <Paperclip className="w-4 h-4" />
                        {msg.file_name}
                      </a>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {formatTime(msg.created_at)}
                    {isOwnMessage && msg.is_read && <span className="ml-2">✓✓</span>}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span>
              {typingUsers.map((u) => u.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t p-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Add attachment"
          >
            <Paperclip className="w-5 h-5 text-gray-500" />
          </button>
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Add emoji"
          >
            <Smile className="w-5 h-5 text-gray-500" />
          </button>
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
