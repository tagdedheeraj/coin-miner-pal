
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

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
      
      // Get all users from Firestore
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(query(usersCollection));
      
      if (usersSnapshot.empty) throw new Error('No users found');
      
      // Update each user with the notification
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const userNotifications = userData.notifications || [];
        
        await updateDoc(doc(db, 'users', userDoc.id), {
          notifications: [...userNotifications, notification],
          updated_at: new Date().toISOString()
        });
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
      
      // Update in Firestore
      await updateDoc(doc(db, 'users', user.id), {
        notifications: updatedNotifications,
        updated_at: new Date().toISOString()
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
