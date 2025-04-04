
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import {
  doc,
  updateDoc,
  collection,
  getDocs,
} from 'firebase/firestore';

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
        id: Date.now().toString(),
        message,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      // Get all users from Firestore
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      // Create batch to update all users efficiently
      const batch = [];
      
      // Add notification to all users
      querySnapshot.forEach((userDoc) => {
        const userId = userDoc.id;
        const userData = userDoc.data();
        const userNotifications = userData.notifications || [];
        
        batch.push(updateDoc(doc(db, 'users', userId), {
          notifications: [...userNotifications, notification]
        }));
      });
      
      // Execute all updates
      await Promise.all(batch);
      
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
      
      // Skip Firestore update for admin users
      if (user.isAdmin) return;
      
      // Update in Firestore
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
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
