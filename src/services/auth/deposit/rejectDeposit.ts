
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

export const rejectDepositFunctions = (user: User | null) => {
  const rejectDepositRequest = async (requestId: string): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can reject deposit requests');
      return;
    }
    
    try {
      // Get the deposit request
      const depositRef = collection(db, 'deposit_requests');
      const q = query(depositRef, where('id', '==', requestId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Deposit request not found');
      }
      
      const requestDoc = querySnapshot.docs[0];
      const requestData = requestDoc.data();
      
      if (requestData.status !== 'pending') {
        throw new Error('This request has already been processed');
      }
      
      // Update request status
      await updateDoc(doc(db, 'deposit_requests', requestDoc.id), {
        status: 'rejected',
        reviewed_at: new Date().toISOString()
      });
      
      // Find the user and send notification
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('email', '==', requestData.user_email));
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) {
        throw new Error('User not found');
      }
      
      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();
      
      const userNotifications = userData.notifications || [];
      const newNotification = {
        id: uuidv4(),
        message: `Your deposit for ${requestData.plan_name} has been rejected. Please contact support for more information.`,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      await updateDoc(doc(db, 'users', userDoc.id), {
        notifications: [...userNotifications, newNotification]
      });
      
      toast.success('Deposit request rejected successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to reject deposit request');
    }
  };

  return { rejectDepositRequest };
};
