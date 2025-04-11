
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { collection, getDocs, query, where, getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';

export const updateUsdtEarningsFunctions = (user: User | null) => {
  // Initialize Firestore
  const db = getFirestore();
  const usersCollectionRef = collection(db, 'users');
  
  const updateUserUsdtEarnings = async (email: string, amount: number): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can update USDT earnings');
      return;
    }

    try {
      console.log(`Updating USDT earnings for ${email} to ${amount}`);
      
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
      
      const oldEarnings = userData.usdt_earnings || 0;
      
      // Update user in Firestore - use the field name 'usdt_earnings'
      await updateDoc(userRef, {
        usdt_earnings: amount,  // This is the critical field to update
        notifications: [
          ...userNotifications,
          {
            id: Date.now().toString(),
            message: `Your USDT earnings have been updated from ${oldEarnings} to ${amount} by admin.`,
            read: false,
            createdAt: new Date().toISOString()
          }
        ]
      });
      
      console.log('USDT earnings updated successfully');
      toast.success(`${email} के लिए USDT अर्निंग अपडेट की गई`);
    } catch (error) {
      console.error('Error updating USDT earnings:', error);
      toast.error(error instanceof Error ? error.message : 'USDT अर्निंग अपडेट करने में विफल');
    }
  };

  return { updateUserUsdtEarnings };
};
