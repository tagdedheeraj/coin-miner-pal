
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export const notificationServiceFunctions = (
  user: User | null,
  setUser: Dispatch<SetStateAction<User | null>>
) => {

  const sendNotificationToAllUsers = async (message: string) => {
    if (!user?.isAdmin) {
      toast.error('Only admins can send notifications');
      return;
    }
    
    try {
      // Now handled in AuthProvider
      toast.success('Notification sent to all users');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to send notification');
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      // Now handled in AuthProvider
      const updatedNotifications = user.notifications?.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      );
      
      // Update the user state
      setUser({
        ...user,
        notifications: updatedNotifications
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to mark notification as read');
    }
  };
  
  return {
    sendNotificationToAllUsers,
    markNotificationAsRead
  };
};
