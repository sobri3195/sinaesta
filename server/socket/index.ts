import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import { 
  handleJoinRoom, 
  handleLeaveRoom, 
  handleSendMessage, 
  handleTypingIndicator,
  handleMarkMessageAsRead
} from './handlers/chatHandlers';
import {
  handleJoinExam,
  handleLeaveExam,
  handleExamProgress,
  handleExamAnswer,
  handleExamComplete
} from './handlers/examHandlers';
import {
  handleLeaderboardRequest,
  handleLeaderboardUpdate
} from './handlers/leaderboardHandlers';
import {
  handleNotificationSend,
  handleNotificationRead,
  handleNotificationReadAll
} from './handlers/notificationHandlers';
import {
  handleStudyGroupCreate,
  handleStudyGroupJoin,
  handleStudyGroupLeave,
  handleStudyGroupMessage
} from './handlers/studyGroupHandlers';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function initializeSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Verify user exists in database
      const result = await query(
        'SELECT id, email, name, role FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        return next(new Error('Authentication error: User not found'));
      }

      const user = result.rows[0];
      socket.userId = user.id;
      socket.userEmail = user.email;
      socket.userName = user.name;
      socket.userRole = user.role;

      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Rate limiting per socket
  const messageRateLimits = new Map<string, { count: number; resetTime: number }>();
  const RATE_LIMIT_WINDOW = 60000; // 1 minute
  const MAX_MESSAGES_PER_WINDOW = 60;

  function checkRateLimit(socketId: string): boolean {
    const now = Date.now();
    const limit = messageRateLimits.get(socketId);

    if (!limit || now > limit.resetTime) {
      messageRateLimits.set(socketId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      return true;
    }

    if (limit.count >= MAX_MESSAGES_PER_WINDOW) {
      return false;
    }

    limit.count++;
    return true;
  }

  // Connection handler
  io.on('connection', async (socket: AuthenticatedSocket) => {
    console.log(`✅ User connected: ${socket.userName} (${socket.userId})`);

    // Update online status
    try {
      await query(
        `INSERT INTO online_users (user_id, socket_id, status, last_seen)
         VALUES ($1, $2, 'online', CURRENT_TIMESTAMP)
         ON CONFLICT (user_id) 
         DO UPDATE SET socket_id = $2, status = 'online', last_seen = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP`,
        [socket.userId, socket.id]
      );

      // Broadcast online status to all connected clients
      io.emit('user-status-change', {
        userId: socket.userId,
        userName: socket.userName,
        status: 'online',
      });
    } catch (error) {
      console.error('Error updating online status:', error);
    }

    // Join user's personal notification room
    socket.join(`user:${socket.userId}`);

    // Chat event handlers
    socket.on('join-room', (data) => handleJoinRoom(io, socket, data));
    socket.on('leave-room', (data) => handleLeaveRoom(io, socket, data));
    socket.on('send-message', (data) => {
      if (!checkRateLimit(socket.id)) {
        socket.emit('error', { message: 'Rate limit exceeded. Please slow down.' });
        return;
      }
      handleSendMessage(io, socket, data);
    });
    socket.on('typing-indicator', (data) => handleTypingIndicator(io, socket, data));
    socket.on('mark-message-read', (data) => handleMarkMessageAsRead(io, socket, data));

    // Exam event handlers
    socket.on('join-exam', (data) => handleJoinExam(io, socket, data));
    socket.on('leave-exam', (data) => handleLeaveExam(io, socket, data));
    socket.on('exam-progress', (data) => handleExamProgress(io, socket, data));
    socket.on('exam-answer', (data) => handleExamAnswer(io, socket, data));
    socket.on('exam-complete', (data) => handleExamComplete(io, socket, data));

    // Leaderboard event handlers
    socket.on('leaderboard-request', (data) => handleLeaderboardRequest(io, socket, data));
    socket.on('leaderboard-update', (data) => handleLeaderboardUpdate(io, socket, data));

    // Notification event handlers
    socket.on('notification-send', (data) => handleNotificationSend(io, socket, data));
    socket.on('notification-read', (data) => handleNotificationRead(io, socket, data));
    socket.on('notification-read-all', () => handleNotificationReadAll(io, socket));

    // Study group event handlers
    socket.on('study-group-create', (data) => handleStudyGroupCreate(io, socket, data));
    socket.on('study-group-join', (data) => handleStudyGroupJoin(io, socket, data));
    socket.on('study-group-leave', (data) => handleStudyGroupLeave(io, socket, data));
    socket.on('study-group-message', (data) => handleStudyGroupMessage(io, socket, data));

    // Heartbeat handler
    socket.on('heartbeat', async () => {
      try {
        await query(
          'UPDATE online_users SET last_seen = CURRENT_TIMESTAMP WHERE user_id = $1',
          [socket.userId]
        );
        socket.emit('heartbeat-ack');
      } catch (error) {
        console.error('Error updating heartbeat:', error);
      }
    });

    // Disconnection handler
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.userName} (${socket.userId})`);

      try {
        // Update online status to offline
        await query(
          `UPDATE online_users 
           SET status = 'offline', last_seen = CURRENT_TIMESTAMP 
           WHERE user_id = $1`,
          [socket.userId]
        );

        // Broadcast offline status
        io.emit('user-status-change', {
          userId: socket.userId,
          userName: socket.userName,
          status: 'offline',
        });

        // Clean up typing indicators
        await query(
          'DELETE FROM typing_indicators WHERE user_id = $1',
          [socket.userId]
        );

        // Clean up rate limit
        messageRateLimits.delete(socket.id);
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });

  // Periodic cleanup of stale connections (every 5 minutes)
  setInterval(async () => {
    try {
      const staleThreshold = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
      
      await query(
        `UPDATE online_users 
         SET status = 'offline' 
         WHERE last_seen < $1 AND status != 'offline'`,
        [staleThreshold]
      );

      // Clean up old typing indicators (older than 30 seconds)
      await query(
        'DELETE FROM typing_indicators WHERE updated_at < NOW() - INTERVAL \'30 seconds\''
      );
    } catch (error) {
      console.error('Error in cleanup:', error);
    }
  }, 5 * 60 * 1000);

  // Update leaderboard ranks periodically (every 5 minutes)
  setInterval(async () => {
    try {
      await query('SELECT update_leaderboard_ranks()');
      
      // Broadcast leaderboard update to all clients
      const result = await query(
        `SELECT user_id, user_name, user_avatar, specialty, total_score, 
                exams_completed, average_score, rank, period
         FROM leaderboard_entries 
         WHERE period = 'weekly'
         ORDER BY rank ASC
         LIMIT 50`
      );

      io.emit('leaderboard-updated', {
        period: 'weekly',
        entries: result.rows,
      });
    } catch (error) {
      console.error('Error updating leaderboard ranks:', error);
    }
  }, 5 * 60 * 1000);

  console.log('✅ Socket.IO server initialized');
  
  return io;
}
