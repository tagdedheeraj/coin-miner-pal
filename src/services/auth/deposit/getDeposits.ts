
import { User, DepositRequest } from '@/types/auth';
import { toast } from 'sonner';
import { mockDepositRequests } from '@/data/mockDepositRequests';
import { collection, getDocs, query, where, orderBy, getFirestore } from 'firebase/firestore';

export const getDepositFunctions = (user: User | null) => {
  const db = getFirestore();
  
  const getDepositRequests = async (): Promise<DepositRequest[]> => {
    if (!user?.isAdmin) {
      return [];
    }
    
    try {
      console.log('Fetching all deposit requests from Firebase');
      
      // Fetch from Firebase
      const depositRequestsRef = collection(db, 'deposit_requests');
      const querySnapshot = await getDocs(query(depositRequestsRef, orderBy('timestamp', 'desc')));
      
      const deposits: DepositRequest[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        deposits.push({
          id: doc.id,
          userId: data.user_id || '',
          userEmail: data.user_email || '',
          userName: data.user_name || '',
          planId: data.plan_id || '',
          planName: data.plan_name || '',
          amount: data.amount || 0,
          transactionId: data.transaction_id || '',
          status: data.status || 'pending',
          timestamp: data.timestamp || new Date().toISOString(),
          reviewedAt: data.reviewed_at || null
        });
      });
      
      // If no data found, return mock data
      if (deposits.length === 0) {
        console.log('No deposit requests found in Firebase, using mock data');
        return mockDepositRequests;
      }
      
      return deposits;
    } catch (error) {
      console.error('Failed to fetch deposit requests:', error);
      toast.error('Failed to fetch deposit requests');
      // Return mock data as fallback
      return mockDepositRequests;
    }
  };

  // Function to get deposit requests for a specific user (non-admin)
  const getUserDepositRequests = async (): Promise<DepositRequest[]> => {
    if (!user) {
      return [];
    }
    
    try {
      console.log('Fetching user deposit requests from Firebase');
      
      // Fetch from Firebase
      const depositRequestsRef = collection(db, 'deposit_requests');
      const querySnapshot = await getDocs(
        query(
          depositRequestsRef, 
          where('user_id', '==', user.id),
          orderBy('timestamp', 'desc')
        )
      );
      
      const deposits: DepositRequest[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        deposits.push({
          id: doc.id,
          userId: data.user_id || '',
          userEmail: data.user_email || '',
          userName: data.user_name || '',
          planId: data.plan_id || '',
          planName: data.plan_name || '',
          amount: data.amount || 0,
          transactionId: data.transaction_id || '',
          status: data.status || 'pending',
          timestamp: data.timestamp || new Date().toISOString(),
          reviewedAt: data.reviewed_at || null
        });
      });
      
      return deposits;
    } catch (error) {
      console.error('Failed to fetch user deposit requests:', error);
      // Use filter on mock data as fallback
      return mockDepositRequests.filter(request => request.userId === user.id);
    }
  };

  return { 
    getDepositRequests,
    getUserDepositRequests
  };
};
