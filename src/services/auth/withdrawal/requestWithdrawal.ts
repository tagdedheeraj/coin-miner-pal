
import { Dispatch, SetStateAction } from 'react';
import { User, WithdrawalRequest } from '@/types/auth';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

export const createWithdrawalRequestFunctions = (
  user: User | null,
  setUser: Dispatch<SetStateAction<User | null>>
) => {
  const requestWithdrawal = async (amount: number): Promise<void> => {
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    if (!user.withdrawalAddress) {
      toast.error('Please set a withdrawal address first');
      return;
    }
    
    if (user.usdtEarnings && amount > user.usdtEarnings) {
      toast.error('Insufficient USDT balance');
      return;
    }
    
    try {
      // Create a new withdrawal request
      const withdrawalId = uuidv4();
      
      const withdrawalRequest: WithdrawalRequest = {
        id: withdrawalId,
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        amount,
        address: user.withdrawalAddress,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      // Add to Firestore
      await setDoc(doc(collection(db, 'withdrawal_requests'), withdrawalId), {
        id: withdrawalId,
        user_id: user.id,
        user_email: user.email,
        user_name: user.name,
        amount,
        address: user.withdrawalAddress,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      
      // Update user's USDT balance locally
      const updatedUser = {
        ...user,
        usdtEarnings: (user.usdtEarnings || 0) - amount
      };
      
      setUser(updatedUser);
      
      toast.success('Withdrawal requested successfully');
    } catch (error) {
      console.error('Withdrawal request error:', error);
      toast.error('Failed to submit withdrawal request');
      throw error;
    }
  };

  return { requestWithdrawal };
};
