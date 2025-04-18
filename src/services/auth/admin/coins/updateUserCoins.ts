
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { collection, getDocs, query, where, getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { createNotification } from '../notifications/notificationHelpers';

export const updateUserCoinsFn = async (
  user: User | null,
  email: string, 
  amount: number
): Promise<boolean> => {
  if (!user?.isAdmin) {
    toast.error('Only admins can update user coins');
    return false;
  }

  try {
    console.log(`Updating coins for ${email} to ${amount}`);
    
    // Initialize Firestore
    const db = getFirestore();
    const usersCollectionRef = collection(db, 'users');
    
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
    
    // Create notification message
    const notificationMessage = `Your coin balance has been updated from ${userData.coins || 0} to ${amount} by admin.`;
    const notification = createNotification(notificationMessage);
    
    // Update only the specific fields we need
    await updateDoc(userRef, {
      coins: amount,
      notifications: [
        ...userNotifications,
        notification
      ]
    });
    
    console.log('Coins updated successfully');
    toast.success(`${email} के लिए सिक्के अपडेट किए गए`);
    return true;
  } catch (error) {
    console.error('Error updating coins:', error);
    toast.error(error instanceof Error ? error.message : 'सिक्के अपडेट करने में विफल');
    return false;
  }
};
