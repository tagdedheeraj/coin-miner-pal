
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { collection, getDocs, query, where, getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';

export const updateCoinsFunctions = (user: User | null) => {
  // Initialize Firestore
  const db = getFirestore();
  const usersCollectionRef = collection(db, 'users');
  
  const updateUserCoins = async (email: string, amount: number): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can update user coins');
      return;
    }

    try {
      console.log(`Updating coins for ${email} to ${amount}`);
      
      // Find user by email
      const q = query(usersCollectionRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast.error('User not found');
        throw new Error('User not found');
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const userNotifications = userData.notifications || [];
      
      // Verify the user exists by getting their document
      const userRef = doc(db, 'users', userDoc.id);
      const userSnapshot = await getDoc(userRef);
      
      if (!userSnapshot.exists()) {
        toast.error('User not found');
        throw new Error('User not found');
      }
      
      // Update user in Firestore
      await updateDoc(userRef, {
        coins: amount,
        notifications: [
          ...userNotifications,
          {
            id: Date.now().toString(),
            message: `Your coin balance has been updated from ${userData.coins || 0} to ${amount} by admin.`,
            read: false,
            createdAt: new Date().toISOString()
          }
        ]
      });
      
      console.log('Coins updated successfully');
      toast.success(`${email} के लिए सिक्के अपडेट किए गए`);
    } catch (error) {
      console.error('Error updating coins:', error);
      toast.error(error instanceof Error ? error.message : 'सिक्के अपडेट करने में विफल');
    }
  };

  return { updateUserCoins };
};
