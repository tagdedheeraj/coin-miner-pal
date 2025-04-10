
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
      // Create the deposit request with a proper id
      const depositRequest: DepositRequest = {
        ...depositData,
        id: uuidv4(),  // Generate a proper UUID for the request
        status: 'pending',
        timestamp: new Date().toISOString()
      };
      
      // First, ensure the user is authenticated
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser.user) {
        throw new Error('Authentication verification failed. Please try again.');
      }
      
      console.log('Creating deposit request directly');
      
      // First, check if the user exists in the public.users table
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (userCheckError) {
        console.log('User not found in database, creating user record first');
        // User doesn't exist in the database yet, so create it first
        const { error: insertUserError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            name: user.name,
            email: user.email,
            coins: user.coins || 0,
            referral_code: user.referralCode,
            has_setup_pin: user.hasSetupPin || false,
            has_biometrics: user.hasBiometrics || false
          });
          
        if (insertUserError) {
          console.error('Failed to create user record:', insertUserError);
          throw new Error(`Failed to create user record: ${insertUserError.message}`);
        }
      }
      
      // Now create the deposit request
      const { error } = await supabase
        .from('deposit_requests')
        .insert({
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
      
      toast.success('Deposit request submitted successfully');
    } catch (error) {
      console.error('Deposit request error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit deposit request');
      throw error;
    }
  };

  return { requestPlanPurchase };
};
