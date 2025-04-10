
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export const rejectDepositFunctions = (user: User | null) => {
  const rejectDepositRequest = async (requestId: string): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can reject deposit requests');
      return;
    }
    
    try {
      // Now handled in AuthProvider
      toast.success('Deposit request rejected successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to reject deposit request');
    }
  };

  return { rejectDepositRequest };
};
