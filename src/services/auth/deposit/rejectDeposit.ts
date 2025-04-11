
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

export const rejectDepositFunctions = (user: User | null) => {
  const db = getFirestore();
  
  const rejectDepositRequest = async (requestId: string): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can reject deposit requests');
      return;
    }
    
    try {
      // Get the deposit request
      const requestRef = doc(db, 'deposit_requests', requestId);
      const requestSnapshot = await getDoc(requestRef);
      
      if (!requestSnapshot.exists()) {
        throw new Error('Deposit request not found');
      }
      
      const requestData = requestSnapshot.data();
      
      if (requestData.status !== 'pending') {
        throw new Error('This request has already been processed');
      }
      
      // Update request status
      await updateDoc(requestRef, {
        status: 'rejected',
        reviewed_at: new Date().toISOString()
      });
      
      // Find the user
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('email', '==', requestData.user_email));
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) {
        throw new Error('User not found');
      }
      
      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();
      const userNotifications = userData.notifications || [];
      
      // Update user with notification
      await updateDoc(doc(db, 'users', userDoc.id), {
        notifications: [
          ...userNotifications,
          {
            id: uuidv4(),
            message: `Your deposit for ${requestData.plan_name} has been rejected. Please contact support for more information.`,
            read: false,
            createdAt: new Date().toISOString()
          }
        ]
      });
      
      toast.success('Deposit request rejected successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to reject deposit request');
    }
  };

  return { rejectDepositRequest };
};
