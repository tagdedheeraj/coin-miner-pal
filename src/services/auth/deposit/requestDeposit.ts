
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
      
      // IMPORTANT: First ensure the user exists in the users table
      // Check if the user exists in the database
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (userCheckError || !existingUser) {
        console.log('User does not exist in database, creating user record first');
        // User doesn't exist in the database, create the user record
        const userDbData = mapUserToDb(user);
        
        const { error: createUserError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            name: user.name,
            email: user.email,
            coins: user.coins || 0,
            referral_code: user.referralCode,
            has_setup_pin: user.hasSetupPin || false,
            has_biometrics: user.hasBiometrics || false,
            withdrawal_address: user.withdrawalAddress,
            applied_referral_code: user.appliedReferralCode,
            usdt_earnings: user.usdtEarnings || 0,
            notifications: user.notifications || [],
            is_admin: user.isAdmin || false
          });
          
        if (createUserError) {
          console.error('Failed to create user record:', createUserError);
          throw new Error(`Failed to create user record: ${createUserError.message}`);
        }
      }
      
      // Map to database format
      const dbDeposit = mapDepositToDb(depositRequest);
      
      // Now create the deposit request
      const { error } = await supabase
        .from('deposit_requests')
        .insert({
          id: dbDeposit.id,
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
