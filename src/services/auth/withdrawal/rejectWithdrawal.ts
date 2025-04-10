
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export const rejectWithdrawalFunctions = (user: User | null) => {
  const rejectWithdrawalRequest = async (requestId: string): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can reject withdrawal requests');
      return;
    }
    
    try {
      // Now handled in AuthProvider
      toast.success('Withdrawal request rejected successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to reject withdrawal request');
    }
  };

  return { rejectWithdrawalRequest };
};
