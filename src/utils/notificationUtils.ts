
import { Notification } from '@/types/auth';

export const parseNotifications = (
  notifications: any[] | undefined
): Notification[] => {
  if (!notifications || !Array.isArray(notifications)) {
    return [];
  }

  return notifications.map(n => ({
    id: n.id || '',
    message: n.message || '',
    read: n.read || false,
    createdAt: n.createdAt || new Date().toISOString()
  }));
};
