
import { User, WithdrawalRequest } from '@/types/auth';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from 'firebase/firestore';

export const withdrawalServiceFunctions = (user: User | null) => {

  const requestWithdrawal = async (amount: number): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    if (user.isAdmin) throw new Error('Admin cannot request withdrawals');
    
    if (!user.withdrawalAddress) {
      throw new Error('Please set a withdrawal address first');
    }
    
    try {
      // Calculate available USDT balance
      const availableBalance = user.usdtEarnings || 0;
      
      if (amount > availableBalance) {
        throw new Error('Insufficient balance');
      }
      
      if (amount < 50) {
        throw new Error('Minimum withdrawal amount is $50');
      }
      
      // Create withdrawal request in Firestore
      const withdrawalRequest: Omit<WithdrawalRequest, 'id'> = {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        amount,
        address: user.withdrawalAddress,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      const withdrawalRef = await addDoc(collection(db, 'withdrawalRequests'), withdrawalRequest);
      
      // Create notification for user
      const notification = {
        id: Date.now().toString(),
        message: `Your withdrawal request for $${amount.toFixed(2)} USDT has been submitted and is awaiting approval.`,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      // Update user document with notification
      const userRef = doc(db, 'users', user.id);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userNotifications = userData.notifications || [];
        
        await updateDoc(userRef, {
          notifications: [...userNotifications, notification]
        });
      }
      
      toast.success('Withdrawal request submitted successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to request withdrawal');
      throw error;
    }
  };
  
  const getWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
    if (!user?.isAdmin) {
      return [];
    }
    
    try {
      const withdrawalRequestsRef = collection(db, 'withdrawalRequests');
      const querySnapshot = await getDocs(withdrawalRequestsRef);
      
      const withdrawalRequests: WithdrawalRequest[] = [];
      
      querySnapshot.forEach((doc) => {
        withdrawalRequests.push({
          id: doc.id,
          ...doc.data()
        } as WithdrawalRequest);
      });
      
      return withdrawalRequests;
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch withdrawal requests');
      return [];
    }
  };
  
  const approveWithdrawalRequest = async (requestId: string): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can approve withdrawal requests');
      return;
    }
    
    try {
      // Get the withdrawal request
      const requestRef = doc(db, 'withdrawalRequests', requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) {
        toast.error('Withdrawal request not found');
        return;
      }
      
      const request = requestDoc.data() as WithdrawalRequest;
      
      if (request.status !== 'pending') {
        toast.error('This request has already been processed');
        return;
      }
      
      // Update request status
      await updateDoc(requestRef, {
        status: 'approved',
        updatedAt: new Date().toISOString()
      });
      
      // Find the user and update their USDT earnings
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', request.userEmail));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userId = userDoc.id;
        const userData = userDoc.data() as User;
        
        const userRef = doc(db, 'users', userId);
        const currentEarnings = userData.usdtEarnings || 0;
        const userNotifications = userData.notifications || [];
        
        await updateDoc(userRef, {
          usdtEarnings: currentEarnings - request.amount,
          notifications: [
            ...userNotifications,
            {
              id: Date.now().toString(),
              message: `Your withdrawal request for $${request.amount.toFixed(2)} USDT has been approved and processed.`,
              read: false,
              createdAt: new Date().toISOString()
            }
          ]
        });
      }
      
      toast.success('Withdrawal request approved successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to approve withdrawal request');
    }
  };
  
  const rejectWithdrawalRequest = async (requestId: string): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can reject withdrawal requests');
      return;
    }
    
    try {
      // Get the withdrawal request
      const requestRef = doc(db, 'withdrawalRequests', requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) {
        toast.error('Withdrawal request not found');
        return;
      }
      
      const request = requestDoc.data() as WithdrawalRequest;
      
      if (request.status !== 'pending') {
        toast.error('This request has already been processed');
        return;
      }
      
      // Update request status
      await updateDoc(requestRef, {
        status: 'rejected',
        updatedAt: new Date().toISOString()
      });
      
      // Find the user and send notification
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', request.userEmail));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userId = userDoc.id;
        const userData = userDoc.data() as User;
        
        const userRef = doc(db, 'users', userId);
        const userNotifications = userData.notifications || [];
        
        await updateDoc(userRef, {
          notifications: [
            ...userNotifications,
            {
              id: Date.now().toString(),
              message: `Your withdrawal request for $${request.amount.toFixed(2)} USDT has been rejected. Please contact support for more information.`,
              read: false,
              createdAt: new Date().toISOString()
            }
          ]
        });
      }
      
      toast.success('Withdrawal request rejected successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to reject withdrawal request');
    }
  };
  
  return {
    requestWithdrawal,
    getWithdrawalRequests,
    approveWithdrawalRequest,
    rejectWithdrawalRequest
  };
};
