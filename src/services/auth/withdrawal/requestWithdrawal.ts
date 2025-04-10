
import { User, WithdrawalRequest } from '@/types/auth';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

export const requestWithdrawalFunctions = (user: User | null) => {
  const createWithdrawalRequest = async (amount: number): Promise<void> => {
    if (!user) {
      toast.error('You must be logged in to request a withdrawal');
      return;
    }
    
    if (!user.withdrawalAddress) {
      toast.error('Please set a withdrawal address first');
      return;
    }
    
    if (user.usdtEarnings === undefined || amount > user.usdtEarnings) {
      toast.error('Insufficient USDT balance');
      return;
    }
    
    try {
      const withdrawalRequest: WithdrawalRequest = {
        id: uuidv4(),
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        amount,
        address: user.withdrawalAddress,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      // Add to Firestore
      await addDoc(collection(db, 'withdrawal_requests'), {
        id: withdrawalRequest.id,
        user_id: withdrawalRequest.userId,
        user_email: withdrawalRequest.userEmail,
        user_name: withdrawalRequest.userName,
        amount: withdrawalRequest.amount,
        address: withdrawalRequest.address,
        status: withdrawalRequest.status,
        created_at: withdrawalRequest.createdAt,
        updated_at: null
      });
      
      toast.success('Withdrawal request submitted successfully');
    } catch (error) {
      console.error('Error creating withdrawal request:', error);
      toast.error('Failed to submit withdrawal request');
    }
  };

  return { createWithdrawalRequest };
};
