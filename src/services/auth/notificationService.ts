
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { Dispatch, SetStateAction } from 'react';

export const notificationServiceFunctions = (
  user: User | null,
  setUser: Dispatch<SetStateAction<User | null>>
) => {
  const sendNotificationToAllUsers = async (message: string): Promise<void> => {
    try {
      // In a real app, this would send the notification to a backend service
      toast.success('Notification sent to all users');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    }
  };

  const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    if (!user || !user.notifications) return;
    
    try {
      const updatedNotifications = user.notifications.map(notification => 
        notification.id === notificationId ? { ...notification, read: true } : notification
      );
      
      setUser({
        ...user,
        notifications: updatedNotifications
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  return {
    sendNotificationToAllUsers,
    markNotificationAsRead
  };
};
