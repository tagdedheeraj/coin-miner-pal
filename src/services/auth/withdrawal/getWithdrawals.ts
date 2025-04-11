
import { User, WithdrawalRequest } from '@/types/auth';
import { toast } from 'sonner';
import { mockWithdrawalRequests } from '@/data/mockWithdrawalRequests';
import { collection, getDocs, query, orderBy, getFirestore, where, onSnapshot } from 'firebase/firestore';

// Cache for withdrawal requests
let cachedWithdrawals: WithdrawalRequest[] = [];
let lastFetchTime = 0;

export const getWithdrawalRequestsFunctions = (user: User | null) => {
  const db = getFirestore();
  
  const getWithdrawalRequests = async (forceFresh = true): Promise<WithdrawalRequest[]> => {
    if (!user?.isAdmin) {
      return [];
    }
    
    const currentTime = Date.now();
    const cacheExpired = (currentTime - lastFetchTime) > (2 * 60 * 1000); // 2 minutes cache
    
    if (!forceFresh && !cacheExpired && cachedWithdrawals.length > 0) {
      console.log("Returning cached withdrawals", cachedWithdrawals);
      return cachedWithdrawals;
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
      
      // Update cache
      cachedWithdrawals = withdrawals;
      lastFetchTime = currentTime;
      
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

  // Function to get user's own withdrawal requests (for non-admin users)
  const getUserWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
    if (!user) {
      return [];
    }
    
    try {
      console.log(`Fetching withdrawal requests for user ${user.id}`);
      
      // Fetch from Firebase
      const withdrawalRequestsRef = collection(db, 'withdrawal_requests');
      const querySnapshot = await getDocs(
        query(
          withdrawalRequestsRef, 
          where('user_id', '==', user.id),
          orderBy('created_at', 'desc')
        )
      );
      
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
      
      return withdrawals;
    } catch (error) {
      console.error('Error fetching user withdrawal requests:', error);
      toast.error('Failed to fetch your withdrawal requests');
      return [];
    }
  };

  // Function to set up real-time listener for withdrawal requests
  const subscribeToWithdrawalRequests = (callback: (withdrawals: WithdrawalRequest[]) => void) => {
    if (!user?.isAdmin) {
      return { unsubscribe: () => {} };
    }
    
    const withdrawalRequestsRef = collection(db, 'withdrawal_requests');
    const q = query(withdrawalRequestsRef, orderBy('created_at', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const withdrawals: WithdrawalRequest[] = [];
      snapshot.forEach((doc) => {
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
      
      // Update cache
      cachedWithdrawals = withdrawals;
      lastFetchTime = Date.now();
      
      callback(withdrawals);
    }, (error) => {
      console.error('Error in withdrawal requests subscription:', error);
      toast.error('Failed to subscribe to withdrawal updates');
    });
    
    return { unsubscribe };
  };

  return { 
    getWithdrawalRequests,
    getUserWithdrawalRequests,
    subscribeToWithdrawalRequests
  };
};
