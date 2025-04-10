
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

export const approveWithdrawalFunctions = (user: User | null) => {
  const approveWithdrawalRequest = async (requestId: string): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can approve withdrawal requests');
      return;
    }
    
    try {
      // Get the withdrawal request
      const withdrawalRef = collection(db, 'withdrawal_requests');
      const q = query(withdrawalRef, where('id', '==', requestId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Withdrawal request not found');
      }
      
      const requestDoc = querySnapshot.docs[0];
      const requestData = requestDoc.data();
      
      if (requestData.status !== 'pending') {
        throw new Error('This request has already been processed');
      }
      
      // Update request status
      await updateDoc(doc(db, 'withdrawal_requests', requestDoc.id), {
        status: 'approved',
        updated_at: new Date().toISOString()
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
      
      // Update user balance
      const currentUsdtEarnings = userData.usdt_earnings || 0;
      const newUsdtEarnings = Math.max(0, currentUsdtEarnings - requestData.amount);
      
      const userNotifications = userData.notifications || [];
      
      await updateDoc(doc(db, 'users', userDoc.id), {
        usdt_earnings: newUsdtEarnings,
        notifications: [
          ...userNotifications,
          {
            id: uuidv4(),
            message: `Your withdrawal request for $${requestData.amount.toFixed(2)} USDT has been approved.`,
            read: false,
            createdAt: new Date().toISOString()
          }
        ]
      });
      
      toast.success('Withdrawal request approved successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to approve withdrawal request');
    }
  };

  return { approveWithdrawalRequest };
};
