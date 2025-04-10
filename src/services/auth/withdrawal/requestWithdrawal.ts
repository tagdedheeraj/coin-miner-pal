
import { Dispatch, SetStateAction } from 'react';
import { User, WithdrawalRequest } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { mapWithdrawalToDb } from '@/utils/supabaseUtils';

export const createWithdrawalRequestFunctions = (
  user: User | null,
  setUser: Dispatch<SetStateAction<User | null>>
) => {
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
      
      // First, ensure the user is authenticated
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser.user) {
        throw new Error('Authentication verification failed. Please try again.');
      }
      
      console.log('Creating withdrawal request directly');
      
      // Convert to supabase format
      const dbData = mapWithdrawalToDb(request);
      
      // Ensure all required fields are present
      if (!dbData.user_id || !dbData.user_email || !dbData.user_name || 
          !dbData.amount || !dbData.address) {
        throw new Error('Missing required withdrawal request fields');
      }
      
      // Now create the withdrawal request with properly typed data
      const { error } = await supabase
        .from('withdrawal_requests')
        .insert({
          id: dbData.id,
          user_id: dbData.user_id,
          user_email: dbData.user_email,
          user_name: dbData.user_name,
          amount: dbData.amount,
          address: dbData.address,
          status: dbData.status || 'pending',
          created_at: dbData.created_at || new Date().toISOString()
        });
      
      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(`Failed to submit withdrawal request: ${error.message}`);
      }
      
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
