
import { User, WithdrawalRequest } from '@/types/auth';
import { toast } from 'sonner';

export const getWithdrawalFunctions = (user: User | null) => {
  const getWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
    if (!user?.isAdmin) {
      return [];
    }
    
    try {
      // Now handled in AuthProvider
      return [];
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch withdrawal requests');
      return [];
    }
  };

  return { getWithdrawalRequests };
};
