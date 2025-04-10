
import { User, WithdrawalRequest } from '@/types/auth';
import { toast } from 'sonner';

export const getWithdrawalFunctions = (user: User | null) => {
  const getWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
    if (!user?.isAdmin) {
      return [];
    }
    
    try {
      // Get withdrawal requests from local storage
      const withdrawalRequestsJson = localStorage.getItem('withdrawalRequests');
      return withdrawalRequestsJson ? JSON.parse(withdrawalRequestsJson) : [];
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch withdrawal requests');
      return [];
    }
  };

  return { getWithdrawalRequests };
};
