
import { User } from '@/types/auth';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

export const adminServiceFunctions = (user: User | null) => {

  const updateUserUsdtEarnings = async (email: string, amount: number): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can update USDT earnings');
      return;
    }

    try {
      // Find the user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('User not found');
      }
      
      // Get the first user doc (there should only be one)
      const userDoc = querySnapshot.docs[0];
      const userId = userDoc.id;
      const userData = userDoc.data() as User;
      
      // Update USDT earnings and add notification
      const userRef = doc(db, 'users', userId);
      const userNotifications = userData.notifications || [];
      
      await updateDoc(userRef, {
        usdtEarnings: amount,
        notifications: [
          ...userNotifications,
          {
            id: Date.now().toString(),
            message: `Your USDT earnings have been updated from ${userData.usdtEarnings || 0} to ${amount} by admin.`,
            read: false,
            createdAt: new Date().toISOString()
          }
        ]
      });
      
      toast.success(`USDT earnings updated for ${email}`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to update USDT earnings');
      throw error;
    }
  };

  const updateUserCoins = async (email: string, amount: number): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can update user coins');
      return;
    }

    try {
      // Find the user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('User not found');
      }
      
      // Get the first user doc (there should only be one)
      const userDoc = querySnapshot.docs[0];
      const userId = userDoc.id;
      const userData = userDoc.data() as User;
      
      // Update coins and add notification
      const userRef = doc(db, 'users', userId);
      const userNotifications = userData.notifications || [];
      
      await updateDoc(userRef, {
        coins: amount,
        notifications: [
          ...userNotifications,
          {
            id: Date.now().toString(),
            message: `Your coin balance has been updated from ${userData.coins} to ${amount} by admin.`,
            read: false,
            createdAt: new Date().toISOString()
          }
        ]
      });
      
      toast.success(`Coins updated for ${email}`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to update coins');
      throw error;
    }
  };
  
  return {
    updateUserUsdtEarnings,
    updateUserCoins
  };
};
