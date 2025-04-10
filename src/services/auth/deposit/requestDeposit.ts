
import { Dispatch, SetStateAction } from 'react';
import { User, DepositRequest } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { mapDepositToDb, mapUserToDb } from '@/utils/supabaseUtils';

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
      
      // First, ensure the user exists in Supabase by checking auth table
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser.user) {
        throw new Error('Authentication verification failed. Please try again.');
      }
      
      // Map to database format
      const dbDeposit = mapDepositToDb(depositRequest);
      
      // Save to Supabase with explicit foreign key
      const { error } = await supabase
        .from('deposit_requests')
        .insert({
          id: dbDeposit.id,
          user_id: user.id,
          user_email: dbDeposit.user_email,
          user_name: dbDeposit.user_name,
          plan_id: dbDeposit.plan_id,
          plan_name: dbDeposit.plan_name,
          amount: dbDeposit.amount,
          transaction_id: dbDeposit.transaction_id,
          status: dbDeposit.status,
          timestamp: dbDeposit.timestamp,
          reviewed_at: dbDeposit.reviewed_at
        });
      
      if (error) {
        console.error('Supabase insert error:', error);
        
        if (error.message.includes('violates foreign key constraint')) {
          // Try to create the user record first since it might be missing
          const userDbData = mapUserToDb(user);
          
          await supabase
            .from('users')
            .upsert(userDbData as any, { onConflict: 'id' });
          
          // Try the deposit request again
          const { error: retryError } = await supabase
            .from('deposit_requests')
            .insert({
              id: dbDeposit.id,
              user_id: user.id,
              user_email: dbDeposit.user_email,
              user_name: dbDeposit.user_name,
              plan_id: dbDeposit.plan_id,
              plan_name: dbDeposit.plan_name,
              amount: dbDeposit.amount,
              transaction_id: dbDeposit.transaction_id,
              status: dbDeposit.status,
              timestamp: dbDeposit.timestamp,
              reviewed_at: dbDeposit.reviewed_at
            });
            
          if (retryError) {
            throw new Error(`Unable to create deposit request after retry: ${retryError.message}`);
          }
        } else {
          throw new Error(`Failed to submit deposit request: ${error.message}`);
        }
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
      
      toast.success('Deposit request submitted successfully');
    } catch (error) {
      console.error('Deposit request error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit deposit request');
      throw error;
    }
  };

  return { requestPlanPurchase };
};
