
import { Dispatch, SetStateAction } from 'react';
import { User, DepositRequest } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export const createDepositRequestFunctions = (
  user: User | null,
  setUser: Dispatch<SetStateAction<User | null>>
) => {
  const requestPlanPurchase = async (depositData: Omit<DepositRequest, 'id' | 'status' | 'reviewedAt'>): Promise<void> => {
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    try {
      // Create a unique ID for the deposit request
      const depositId = uuidv4();
      
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session found. Please sign in again.');
      }
      
      // Create the deposit request directly using the current session
      const { error } = await supabase
        .from('deposit_requests')
        .insert({
          id: depositId,
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
      
      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(`Failed to submit deposit request: ${error.message}`);
      }
      
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
      
    } catch (error) {
      console.error('Deposit request error:', error);
      throw error;
    }
  };

  return { requestPlanPurchase };
};
