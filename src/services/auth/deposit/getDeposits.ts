
import { User, DepositRequest } from '@/types/auth';
import { toast } from 'sonner';

export const getDepositFunctions = (user: User | null) => {
  const getDepositRequests = async (): Promise<DepositRequest[]> => {
    if (!user?.isAdmin) {
      return [];
    }
    
    try {
      // Now handled in AuthProvider
      return [];
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
      // Now handled in AuthProvider
      return [];
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
