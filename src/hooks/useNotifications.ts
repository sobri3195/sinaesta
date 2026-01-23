import { useEffect, useState, useCallback } from 'react';
import { socketService } from '../services/socketService';

export interface Notification {
  id: string;
  user_id: string;
  type: 'EXAM_UPDATE' | 'MESSAGE' | 'LEADERBOARD' | 'SYSTEM';
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  action_url?: string;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!socketService.isConnected()) {
      return;
    }

    // Set up event listeners
    const handleNewNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      if (!notification.is_read) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    const handleNotificationRead = (data: { notificationId: string; unreadCount: number }) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === data.notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount(data.unreadCount);
    };

    const handleNotificationsReadAll = (data: { unreadCount: number }) => {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(data.unreadCount);
    };

    socketService.on('new-notification', handleNewNotification);
    socketService.on('notification-read', handleNotificationRead);
    socketService.on('notifications-read-all', handleNotificationsReadAll);

    // Cleanup
    return () => {
      socketService.off('new-notification', handleNewNotification);
      socketService.off('notification-read', handleNotificationRead);
      socketService.off('notifications-read-all', handleNotificationsReadAll);
    };
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    if (socketService.isConnected()) {
      socketService.markNotificationAsRead(notificationId);
    }
  }, []);

  const markAllAsRead = useCallback(() => {
    if (socketService.isConnected()) {
      socketService.markAllNotificationsAsRead();
    }
  }, []);

  const sendNotification = useCallback(
    (data: {
      userId?: string;
      type: string;
      title: string;
      message: string;
      data?: any;
      priority?: string;
      actionUrl?: string;
    }) => {
      if (socketService.isConnected()) {
        socketService.sendNotification(data);
      }
    },
    []
  );

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    sendNotification,
  };
}
