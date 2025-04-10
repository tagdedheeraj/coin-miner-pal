
import { Dispatch, SetStateAction } from 'react';
import { User, DepositRequest } from '@/types/auth';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { createFirestoreDoc } from '@/utils/migrationUtils';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

export const createDepositRequestFunctions = (
  user: User | null,
  setUser: Dispatch<SetStateAction<User | null>>
) => {
  const requestPlanPurchase = async (depositData: Omit<DepositRequest, 'id' | 'status' | 'reviewedAt'>): Promise<void> => {
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    try {
      // Create the deposit request with a proper id
      const depositRequest: DepositRequest = {
        ...depositData,
        id: uuidv4(),  // Generate a proper UUID for the request
        status: 'pending',
        timestamp: new Date().toISOString()
      };
      
      console.log('Creating deposit request directly');
      
      // Now create the deposit request directly using Firebase
      await addDoc(collection(db, 'deposit_requests'), {
        id: depositRequest.id,
        user_id: user.id,
        user_email: depositData.userEmail,
        user_name: depositData.userName,
        plan_id: depositData.planId,
        plan_name: depositData.planName,
        amount: depositData.amount,
        transaction_id: depositData.transactionId,
        status: 'pending',
        timestamp: new Date().toISOString(),
        reviewed_at: null
      });
      
      // Add notification to user
      const notification = {
        id: uuidv4(),
        message: `Your deposit for ${depositData.planName} of $${depositData.amount} is being reviewed.`,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      // Update user with notification (only in local state, not trying to update DB)
      const userNotifications = user.notifications || [];
      setUser({
        ...user,
        notifications: [...userNotifications, notification]
      });
      
      toast.success('Deposit request submitted successfully');
    } catch (error) {
      console.error('Deposit request error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit deposit request');
      throw error;
    }
  };

  return { requestPlanPurchase };
};
