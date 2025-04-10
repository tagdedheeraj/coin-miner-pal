
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export const createWithdrawalRequestFunctions = (
  user: User | null,
  setUser: Dispatch<SetStateAction<User | null>>
) => {
  
  const requestWithdrawal = async (amount: number): Promise<void> => {
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    try {
      // Now handled in AuthProvider
      toast.success('Withdrawal request submitted');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit withdrawal request');
      throw error;
    }
  };
  
  return {
    requestWithdrawal
  };
};
