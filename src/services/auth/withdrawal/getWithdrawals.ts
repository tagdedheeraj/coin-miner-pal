
import { User, WithdrawalRequest } from '@/types/auth';
import { toast } from 'sonner';
import { mockWithdrawalRequests } from '@/data/mockWithdrawalRequests';
import { collection, getDocs, query, orderBy, getFirestore } from 'firebase/firestore';

export const getWithdrawalRequestsFunctions = (user: User | null) => {
  const db = getFirestore();
  
  const getWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
    if (!user?.isAdmin) {
      return [];
    }
    
    try {
      console.log('Fetching all withdrawal requests from Firebase');
      
      // Fetch from Firebase
      const withdrawalRequestsRef = collection(db, 'withdrawal_requests');
      const querySnapshot = await getDocs(query(withdrawalRequestsRef, orderBy('created_at', 'desc')));
      
      const withdrawals: WithdrawalRequest[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        withdrawals.push({
          id: doc.id,
          userId: data.user_id || '',
          userEmail: data.user_email || '',
          userName: data.user_name || '',
          amount: data.amount || 0,
          address: data.address || '',
          status: data.status || 'pending',
          createdAt: data.created_at || new Date().toISOString(),
          updatedAt: data.updated_at || null
        });
      });
      
      // If no data found, return mock data
      if (withdrawals.length === 0) {
        console.log('No withdrawal requests found in Firebase, using mock data');
        return mockWithdrawalRequests;
      }
      
      return withdrawals;
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch withdrawal requests');
      // Return mock data as fallback
      return mockWithdrawalRequests;
    }
  };

  return { getWithdrawalRequests };
};
