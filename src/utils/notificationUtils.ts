
/**
 * Parses notifications from various formats into a standardized format
 */
export const parseNotifications = (notifications: any): Array<{id: string, message: string, read: boolean, createdAt: string}> => {
  if (!notifications) return [];
  
  if (Array.isArray(notifications)) {
    return notifications.map(notification => ({
      id: notification.id || `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      message: notification.message || 'Notification',
      read: notification.read || false,
      createdAt: notification.createdAt || new Date().toISOString()
    }));
  }
  
  return [];
};
