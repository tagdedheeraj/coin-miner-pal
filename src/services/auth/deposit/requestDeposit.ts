
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
      // First, check if the user exists in the users table
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
      
      // If user doesn't exist in the database, create it first
      if (userCheckError || !existingUser) {
        console.log('User not found in database, creating user record...');
        
        // Create user in the database
        const userDbData = mapUserToDb({
          id: user.id,
          name: user.name,
          email: user.email,
          coins: user.coins || 0,
          referralCode: user.referralCode,
          hasSetupPin: user.hasSetupPin || false,
          hasBiometrics: user.hasBiometrics || false,
          withdrawalAddress: user.withdrawalAddress,
          appliedReferralCode: user.appliedReferralCode,
          usdtEarnings: user.usdtEarnings || 0,
          notifications: user.notifications || [],
          isAdmin: user.isAdmin || false
        });
        
        const { error: createUserError } = await supabase
          .from('users')
          .insert(userDbData as any);
        
        if (createUserError) {
          console.error('Error creating user in database:', createUserError);
          throw new Error(`Failed to create user in database: ${createUserError.message}`);
        }
      }
      
      // Create the deposit request with a proper id
      const depositRequest: DepositRequest = {
        ...depositData,
        id: uuidv4(),  // Generate a proper UUID for the request
        status: 'pending',
        timestamp: new Date().toISOString()
      };
      
      // Map to database format
      const dbDeposit = mapDepositToDb(depositRequest);
      
      // Save to Supabase
      const { error } = await supabase
        .from('deposit_requests')
        .insert(dbDeposit as any); // Using type assertion to bypass TypeScript check
      
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
      
      // Update user with notification
      const userNotifications = user.notifications || [];
      const userUpdate = mapUserToDb({
        notifications: [...userNotifications, notification]
      });
      
      const { error: updateError } = await supabase
        .from('users')
        .update(userUpdate)
        .eq('id', user.id);
        
      if (updateError) {
        console.error('Error updating user notifications:', updateError);
        // Continue even if notification update fails
      } else {
        // Update local user state
        setUser({
          ...user,
          notifications: [...userNotifications, notification]
        });
      }
      
      toast.success('Deposit request submitted successfully');
    } catch (error) {
      console.error('Deposit request error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit deposit request');
      throw error;
    }
  };

  return { requestPlanPurchase };
};
