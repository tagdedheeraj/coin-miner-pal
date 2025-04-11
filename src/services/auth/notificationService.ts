
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { getFirestore, doc, collection, query, getDocs, updateDoc } from 'firebase/firestore';

export const notificationServiceFunctions = (
  user: User | null,
  setUser: Dispatch<SetStateAction<User | null>>
) => {
  const db = getFirestore();

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
      
      // Get all users from Firebase
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      // Update each user with the notification
      const batch = [];
      querySnapshot.forEach((docSnapshot) => {
        const userData = docSnapshot.data();
        const userNotifications = userData.notifications || [];
        
        batch.push(updateDoc(doc(db, 'users', docSnapshot.id), {
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
      
      // Skip Firebase update for admin users 
      if (user.isAdmin) return;
      
      // Update in Firebase
      try {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, {
          notifications: updatedNotifications
        });
      } catch (firestoreError) {
        console.error('Firebase update error:', firestoreError);
        // Continue even if Firebase update fails
      }
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
