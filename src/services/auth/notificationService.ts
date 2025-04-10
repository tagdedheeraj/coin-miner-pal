
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { Dispatch, SetStateAction } from 'react';

export const notificationServiceFunctions = (
  user: User | null,
  setUser: Dispatch<SetStateAction<User | null>>
) => {
  const sendNotificationToAllUsers = async (message: string): Promise<void> => {
    toast.success('Notification sent to all users');
  };

  const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    if (!user || !user.notifications) return;
    
    const updatedNotifications = user.notifications.map(notification => 
      notification.id === notificationId ? { ...notification, read: true } : notification
    );
    
    setUser({
      ...user,
      notifications: updatedNotifications
    });
  };

  return {
    sendNotificationToAllUsers,
    markNotificationAsRead
  };
};
