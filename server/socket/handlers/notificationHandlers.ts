import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../index';
import { query } from '../../config/database';

export async function handleNotificationSend(
  io: Server, 
  socket: AuthenticatedSocket, 
  data: { 
    userId?: string; 
    type: string; 
    title: string; 
    message: string; 
    data?: any;
    priority?: string;
    actionUrl?: string;
  }
) {
  try {
    const { userId, type, title, message, data: notificationData, priority = 'normal', actionUrl } = data;

    // Only admins and mentors can send notifications to other users
    if (userId && userId !== socket.userId) {
      if (socket.userRole !== 'SUPER_ADMIN' && 
          socket.userRole !== 'PROGRAM_ADMIN' && 
          socket.userRole !== 'MENTOR') {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }
    }

    const targetUserId = userId || socket.userId;

    // Save notification to database
    const result = await query(
      `INSERT INTO notifications (user_id, type, title, message, data, priority, action_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [targetUserId, type, title, message, JSON.stringify(notificationData), priority, actionUrl]
    );

    const notification = result.rows[0];

    // Send real-time notification to user if online
    io.to(`user:${targetUserId}`).emit('new-notification', notification);

    // Acknowledge notification sent
    socket.emit('notification-sent', {
      notificationId: notification.id,
      timestamp: new Date(),
    });

    console.log(`Notification sent to user ${targetUserId} by ${socket.userName}`);
  } catch (error) {
    console.error('Error sending notification:', error);
    socket.emit('error', { message: 'Failed to send notification' });
  }
}

export async function handleNotificationRead(
  io: Server, 
  socket: AuthenticatedSocket, 
  data: { notificationId: string }
) {
  try {
    const { notificationId } = data;

    if (!notificationId) {
      socket.emit('error', { message: 'Notification ID is required' });
      return;
    }

    // Mark notification as read
    await query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [notificationId, socket.userId]
    );

    // Get unread count
    const countResult = await query(
      'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = $1 AND is_read = false',
      [socket.userId]
    );

    const unreadCount = parseInt(countResult.rows[0].unread_count);

    // Send updated unread count
    socket.emit('notification-read', {
      notificationId,
      unreadCount,
    });

    console.log(`Notification ${notificationId} marked as read by ${socket.userName}`);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    socket.emit('error', { message: 'Failed to mark notification as read' });
  }
}

export async function handleNotificationReadAll(io: Server, socket: AuthenticatedSocket) {
  try {
    // Mark all notifications as read
    await query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [socket.userId]
    );

    // Send updated unread count (0)
    socket.emit('notifications-read-all', {
      unreadCount: 0,
    });

    console.log(`All notifications marked as read by ${socket.userName}`);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    socket.emit('error', { message: 'Failed to mark all notifications as read' });
  }
}
