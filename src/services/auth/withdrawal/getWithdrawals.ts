
import { User, WithdrawalRequest } from '@/types/auth';
import { toast } from 'sonner';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

export const getWithdrawalFunctions = (user: User | null) => {
  const getWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
    if (!user?.isAdmin) {
      return [];
    }
    
    try {
      const withdrawalRef = collection(db, 'withdrawal_requests');
      const q = query(withdrawalRef, orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const withdrawals = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.id || doc.id,
          userId: data.user_id,
          userEmail: data.user_email,
          userName: data.user_name,
          amount: data.amount,
          address: data.address,
          status: data.status,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        } as WithdrawalRequest;
      });
      
      return withdrawals;
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch withdrawal requests');
      return [];
    }
  };

  return { getWithdrawalRequests };
};
