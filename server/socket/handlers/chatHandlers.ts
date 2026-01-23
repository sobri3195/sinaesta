import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../index';
import { query } from '../../config/database';
import DOMPurify from 'isomorphic-dompurify';

export async function handleJoinRoom(io: Server, socket: AuthenticatedSocket, data: { roomId: string }) {
  try {
    const { roomId } = data;

    if (!roomId) {
      socket.emit('error', { message: 'Room ID is required' });
      return;
    }

    // Verify room exists or create it
    const roomResult = await query(
      'SELECT id, type, participants FROM chat_rooms WHERE id = $1',
      [roomId]
    );

    let room;
    if (roomResult.rows.length === 0) {
      // Create new room if it doesn't exist
      const createResult = await query(
        `INSERT INTO chat_rooms (id, name, type, participants)
         VALUES ($1, $2, 'DIRECT', ARRAY[$3::uuid])
         RETURNING *`,
        [roomId, `Room ${roomId}`, socket.userId]
      );
      room = createResult.rows[0];
    } else {
      room = roomResult.rows[0];
      
      // Add user to participants if not already in
      if (!room.participants.includes(socket.userId)) {
        await query(
          'UPDATE chat_rooms SET participants = array_append(participants, $1::uuid) WHERE id = $2',
          [socket.userId, roomId]
        );
      }
    }

    // Join the socket room
    socket.join(roomId);

    // Update online users table with current room
    await query(
      'UPDATE online_users SET current_room = $1 WHERE user_id = $2',
      [roomId, socket.userId]
    );

    // Fetch recent messages (last 50)
    const messagesResult = await query(
      `SELECT * FROM chat_messages 
       WHERE room_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [roomId]
    );

    // Send messages to the user (reverse order for chronological)
    socket.emit('room-joined', {
      roomId,
      messages: messagesResult.rows.reverse(),
    });

    // Notify other users in the room
    socket.to(roomId).emit('user-joined-room', {
      roomId,
      userId: socket.userId,
      userName: socket.userName,
    });

    console.log(`User ${socket.userName} joined room ${roomId}`);
  } catch (error) {
    console.error('Error joining room:', error);
    socket.emit('error', { message: 'Failed to join room' });
  }
}

export async function handleLeaveRoom(io: Server, socket: AuthenticatedSocket, data: { roomId: string }) {
  try {
    const { roomId } = data;

    if (!roomId) {
      socket.emit('error', { message: 'Room ID is required' });
      return;
    }

    // Leave the socket room
    socket.leave(roomId);

    // Update online users table
    await query(
      'UPDATE online_users SET current_room = NULL WHERE user_id = $1',
      [socket.userId]
    );

    // Notify other users in the room
    socket.to(roomId).emit('user-left-room', {
      roomId,
      userId: socket.userId,
      userName: socket.userName,
    });

    socket.emit('room-left', { roomId });

    console.log(`User ${socket.userName} left room ${roomId}`);
  } catch (error) {
    console.error('Error leaving room:', error);
    socket.emit('error', { message: 'Failed to leave room' });
  }
}

export async function handleSendMessage(io: Server, socket: AuthenticatedSocket, data: any) {
  try {
    const { roomId, message, messageType = 'text', fileUrl, fileName, fileSize } = data;

    if (!roomId || !message) {
      socket.emit('error', { message: 'Room ID and message are required' });
      return;
    }

    // Sanitize message to prevent XSS
    const sanitizedMessage = DOMPurify.sanitize(message, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p'],
      ALLOWED_ATTR: ['href', 'target'],
    });

    // Get user info for avatar
    const userResult = await query(
      'SELECT avatar FROM users WHERE id = $1',
      [socket.userId]
    );

    const userAvatar = userResult.rows[0]?.avatar || null;

    // Save message to database
    const result = await query(
      `INSERT INTO chat_messages 
       (room_id, sender_id, sender_name, sender_avatar, message, message_type, file_url, file_name, file_size)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [roomId, socket.userId, socket.userName, userAvatar, sanitizedMessage, messageType, fileUrl, fileName, fileSize]
    );

    const savedMessage = result.rows[0];

    // Broadcast message to all users in the room
    io.to(roomId).emit('receive-message', savedMessage);

    // Get room participants for notifications
    const roomResult = await query(
      'SELECT participants FROM chat_rooms WHERE id = $1',
      [roomId]
    );

    if (roomResult.rows.length > 0) {
      const participants = roomResult.rows[0].participants;
      
      // Send notification to offline participants (excluding sender)
      for (const participantId of participants) {
        if (participantId !== socket.userId) {
          // Check if user is online
          const onlineResult = await query(
            'SELECT status FROM online_users WHERE user_id = $1',
            [participantId]
          );

          if (onlineResult.rows.length === 0 || onlineResult.rows[0].status === 'offline') {
            // Create notification for offline user
            await query(
              `INSERT INTO notifications (user_id, type, title, message, data)
               VALUES ($1, 'MESSAGE', $2, $3, $4)`,
              [
                participantId,
                `New message from ${socket.userName}`,
                sanitizedMessage.substring(0, 100),
                JSON.stringify({ roomId, messageId: savedMessage.id }),
              ]
            );
          } else {
            // Send real-time notification to online user
            io.to(`user:${participantId}`).emit('new-message-notification', {
              roomId,
              senderName: socket.userName,
              message: sanitizedMessage.substring(0, 100),
            });
          }
        }
      }
    }

    console.log(`Message sent in room ${roomId} by ${socket.userName}`);
  } catch (error) {
    console.error('Error sending message:', error);
    socket.emit('error', { message: 'Failed to send message' });
  }
}

export async function handleTypingIndicator(io: Server, socket: AuthenticatedSocket, data: any) {
  try {
    const { roomId, isTyping } = data;

    if (!roomId) {
      socket.emit('error', { message: 'Room ID is required' });
      return;
    }

    if (isTyping) {
      // Add or update typing indicator
      await query(
        `INSERT INTO typing_indicators (room_id, user_id, user_name, is_typing)
         VALUES ($1, $2, $3, true)
         ON CONFLICT ON CONSTRAINT typing_indicators_pkey
         DO UPDATE SET is_typing = true, updated_at = CURRENT_TIMESTAMP`,
        [roomId, socket.userId, socket.userName]
      );
    } else {
      // Remove typing indicator
      await query(
        'DELETE FROM typing_indicators WHERE room_id = $1 AND user_id = $2',
        [roomId, socket.userId]
      );
    }

    // Broadcast typing status to other users in the room
    socket.to(roomId).emit('typing-indicator', {
      roomId,
      userId: socket.userId,
      userName: socket.userName,
      isTyping,
    });
  } catch (error) {
    console.error('Error handling typing indicator:', error);
  }
}

export async function handleMarkMessageAsRead(io: Server, socket: AuthenticatedSocket, data: any) {
  try {
    const { messageId } = data;

    if (!messageId) {
      socket.emit('error', { message: 'Message ID is required' });
      return;
    }

    // Mark message as read
    await query(
      'UPDATE chat_messages SET is_read = true WHERE id = $1',
      [messageId]
    );

    // Get message details for notification
    const messageResult = await query(
      'SELECT room_id, sender_id FROM chat_messages WHERE id = $1',
      [messageId]
    );

    if (messageResult.rows.length > 0) {
      const { room_id, sender_id } = messageResult.rows[0];

      // Notify sender that message was read
      io.to(`user:${sender_id}`).emit('message-read', {
        messageId,
        roomId: room_id,
        readBy: socket.userId,
      });
    }
  } catch (error) {
    console.error('Error marking message as read:', error);
  }
}
