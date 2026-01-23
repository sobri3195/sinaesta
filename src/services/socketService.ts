import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(token: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Chat methods
  joinRoom(roomId: string) {
    this.socket?.emit('join-room', { roomId });
  }

  leaveRoom(roomId: string) {
    this.socket?.emit('leave-room', { roomId });
  }

  sendMessage(roomId: string, message: string, messageType = 'text', fileUrl?: string, fileName?: string, fileSize?: number) {
    this.socket?.emit('send-message', { roomId, message, messageType, fileUrl, fileName, fileSize });
  }

  sendTypingIndicator(roomId: string, isTyping: boolean) {
    this.socket?.emit('typing-indicator', { roomId, isTyping });
  }

  markMessageAsRead(messageId: string) {
    this.socket?.emit('mark-message-read', { messageId });
  }

  // Exam methods
  joinExam(examId: string) {
    this.socket?.emit('join-exam', { examId });
  }

  leaveExam(examId: string) {
    this.socket?.emit('leave-exam', { examId });
  }

  updateExamProgress(examId: string, currentQuestion: number, timeRemaining: number, answers: number[]) {
    this.socket?.emit('exam-progress', { examId, currentQuestion, timeRemaining, answers });
  }

  saveExamAnswer(examId: string, questionIndex: number, answer: number) {
    this.socket?.emit('exam-answer', { examId, questionIndex, answer });
  }

  completeExam(examId: string) {
    this.socket?.emit('exam-complete', { examId });
  }

  // Leaderboard methods
  requestLeaderboard(period = 'weekly', specialty?: string, limit = 50) {
    this.socket?.emit('leaderboard-request', { period, specialty, limit });
  }

  updateLeaderboard() {
    this.socket?.emit('leaderboard-update');
  }

  // Notification methods
  sendNotification(data: {
    userId?: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    priority?: string;
    actionUrl?: string;
  }) {
    this.socket?.emit('notification-send', data);
  }

  markNotificationAsRead(notificationId: string) {
    this.socket?.emit('notification-read', { notificationId });
  }

  markAllNotificationsAsRead() {
    this.socket?.emit('notification-read-all');
  }

  // Study group methods
  createStudyGroup(data: {
    name: string;
    description?: string;
    specialty?: string;
    maxMembers?: number;
    isPublic?: boolean;
  }) {
    this.socket?.emit('study-group-create', data);
  }

  joinStudyGroup(groupId: string) {
    this.socket?.emit('study-group-join', { groupId });
  }

  leaveStudyGroup(groupId: string) {
    this.socket?.emit('study-group-leave', { groupId });
  }

  sendStudyGroupMessage(groupId: string, message: string) {
    this.socket?.emit('study-group-message', { groupId, message });
  }

  // Heartbeat
  sendHeartbeat() {
    this.socket?.emit('heartbeat');
  }

  // Event listeners
  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  once(event: string, callback: (...args: any[]) => void) {
    this.socket?.once(event, callback);
  }
}

export const socketService = new SocketService();
