
import { Dispatch, SetStateAction } from 'react';
import { User, WithdrawalRequest } from '@/types/auth';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

export const createWithdrawalRequestFunctions = (
  user: User | null,
  setUser: Dispatch<SetStateAction<User | null>>
) => {
  const db = getFirestore();
  
  const requestWithdrawal = async (amount: number): Promise<void> => {
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    if (!user.withdrawalAddress) {
      throw new Error('Please set up a withdrawal address first');
    }
    
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    
    try {
      // Create the withdrawal request
      const request: WithdrawalRequest = {
        id: uuidv4(),
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        amount,
        address: user.withdrawalAddress,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      console.log('Creating withdrawal request in Firebase');
      
      // Add withdrawal request to Firestore
      await addDoc(collection(db, 'withdrawal_requests'), {
        id: request.id,
        user_id: request.userId,
        user_email: request.userEmail,
        user_name: request.userName,
        amount: request.amount,
        address: request.address,
        status: request.status,
        created_at: request.createdAt
      });
      
      // Add notification to user
      const notification = {
        id: uuidv4(),
        message: `Your withdrawal request of $${amount} is being reviewed.`,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      // Update user with notification (only in local state, not trying to update DB)
      const userNotifications = user.notifications || [];
      setUser({
        ...user,
        notifications: [...userNotifications, notification]
      });
      
      toast.success('Withdrawal request submitted successfully');
    } catch (error) {
      console.error('Withdrawal request error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit withdrawal request');
      throw error;
    }
  };

  return { requestWithdrawal };
};
