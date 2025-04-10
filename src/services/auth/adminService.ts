
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { getDocumentByField, updateDocument } from '@/utils/firebaseMigration';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

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
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      const userNotifications = userData.notifications || [];
      
      // Update USDT earnings and add notification
      await updateDoc(doc(db, 'users', userId), {
        usdt_earnings: amount,
        notifications: [
          ...userNotifications,
          {
            id: Date.now().toString(),
            message: `Your USDT earnings have been updated from ${userData.usdt_earnings || 0} to ${amount} by admin.`,
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
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      const userNotifications = userData.notifications || [];
      
      // Update coins and add notification
      await updateDoc(doc(db, 'users', userId), {
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
