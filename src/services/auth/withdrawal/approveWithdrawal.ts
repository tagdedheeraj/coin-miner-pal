
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export const approveWithdrawalFunctions = (user: User | null) => {
  const approveWithdrawalRequest = async (requestId: string): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can approve withdrawal requests');
      return;
    }
    
    try {
      // Now handled in AuthProvider
      toast.success('Withdrawal request approved successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to approve withdrawal request');
    }
  };

  return { approveWithdrawalRequest };
};
