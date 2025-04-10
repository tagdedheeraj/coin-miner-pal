
import { Json } from '@/integrations/supabase/types';

// Helper function to safely parse notifications from database JSON
export const parseNotifications = (notifications: Json | null): Array<{id: string, message: string, read: boolean, createdAt: string}> => {
  if (!notifications) return [];
  
  try {
    // If it's already an array, check its structure and convert if needed
    if (Array.isArray(notifications)) {
      return notifications.map(notification => {
        // Handle case where notification might be a primitive value
        if (typeof notification !== 'object' || notification === null) {
          return {
            id: String(Date.now()),
            message: String(notification),
            read: false,
            createdAt: new Date().toISOString()
          };
        }
        
        // Cast to any to safely access properties then convert to the expected format
        const notificationObj = notification as any;
        return {
          id: notificationObj.id || String(Date.now()),
          message: notificationObj.message || 'Notification',
          read: notificationObj.read || false,
          createdAt: notificationObj.createdAt || new Date().toISOString()
        };
      });
    }
    
    // If it's a JSON string, parse it
    if (typeof notifications === 'string') {
      try {
        const parsed = JSON.parse(notifications);
        return Array.isArray(parsed) ? parseNotifications(parsed) : [];
      } catch (e) {
        console.error('Failed to parse notifications JSON string:', e);
        return [];
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error parsing notifications:', error);
    return [];
  }
};
