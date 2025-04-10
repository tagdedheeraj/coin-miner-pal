
import { User, DepositRequest } from '@/types/auth';
import { toast } from 'sonner';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

export const getDepositFunctions = (user: User | null) => {
  const getDepositRequests = async (): Promise<DepositRequest[]> => {
    if (!user?.isAdmin) {
      return [];
    }
    
    try {
      const depositRef = collection(db, 'deposit_requests');
      const q = query(depositRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const deposits = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.id || doc.id,
          userId: data.user_id,
          userEmail: data.user_email,
          userName: data.user_name,
          planId: data.plan_id,
          planName: data.plan_name,
          amount: data.amount,
          transactionId: data.transaction_id,
          status: data.status,
          timestamp: data.timestamp,
          reviewedAt: data.reviewed_at
        } as DepositRequest;
      });
      
      return deposits;
    } catch (error) {
      console.error('Error fetching deposit requests:', error);
      toast.error('Failed to fetch deposit requests');
      return [];
    }
  };

  // Function to get deposit requests for a specific user (non-admin)
  const getUserDepositRequests = async (): Promise<DepositRequest[]> => {
    if (!user) {
      return [];
    }
    
    try {
      const depositRef = collection(db, 'deposit_requests');
      const q = query(
        depositRef, 
        where('user_id', '==', user.id),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      const deposits = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.id || doc.id,
          userId: data.user_id,
          userEmail: data.user_email,
          userName: data.user_name,
          planId: data.plan_id,
          planName: data.plan_name,
          amount: data.amount,
          transactionId: data.transaction_id,
          status: data.status,
          timestamp: data.timestamp,
          reviewedAt: data.reviewed_at
        } as DepositRequest;
      });
      
      return deposits;
    } catch (error) {
      console.error('Error fetching user deposit requests:', error);
      // Don't show toast to avoid spamming the user
      return [];
    }
  };

  return { 
    getDepositRequests,
    getUserDepositRequests
  };
};
