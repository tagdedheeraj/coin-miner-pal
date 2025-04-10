
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export const approveDepositFunctions = (user: User | null) => {
  const approveDepositRequest = async (requestId: string): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can approve deposit requests');
      return;
    }
    
    try {
      // This is now handled in AuthProvider
      toast.success('Deposit request approved successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to approve deposit request');
    }
  };

  return { approveDepositRequest };
};
