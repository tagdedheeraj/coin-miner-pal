
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { mapUserToDb, mapDbToUser } from '@/utils/supabaseUtils';

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
      // Create notification object
      const notification = {
        id: uuidv4(),
        message,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      // Get all users from Supabase
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*');
      
      if (usersError) throw usersError;
      
      // Update each user with the notification
      for (const userData of users) {
        const userObj = mapDbToUser(userData);
        const userNotifications = userObj.notifications || [];
        
        await supabase
          .from('users')
          .update(mapUserToDb({
            notifications: [...userNotifications, notification]
          }))
          .eq('id', userObj.id);
      }
      
      // Update current admin user's state if they have notifications
      if (user && user.isAdmin) {
        const currentUserNotifications = [...(user.notifications || []), notification];
        setUser({
          ...user,
          notifications: currentUserNotifications
        });
      }
      
      toast.success('Notification sent to all users');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to send notification');
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      // Update the notification in the current user's state
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
      
      // Skip Supabase update for admin users
      if (user.isAdmin) return;
      
      // Update in Supabase
      const { error } = await supabase
        .from('users')
        .update(mapUserToDb({
          notifications: updatedNotifications
        }))
        .eq('id', user.id);
        
      if (error) throw error;
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
