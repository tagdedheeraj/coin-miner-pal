
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
      // Create the deposit request
      const depositRequest = mapDepositToDb({
        ...depositData,
        status: 'pending',
        timestamp: new Date().toISOString()
      });
      
      // Save to Supabase - using 'as any' to bypass TypeScript for this operation
      const { error } = await supabase
        .from('deposit_requests')
        .insert(depositRequest as any);
      
      if (error) throw error;
      
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
        .update(userUpdate as any)
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Update local user state
      setUser({
        ...user,
        notifications: [...userNotifications, notification]
      });
      
      toast.success('Deposit request submitted successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit deposit request');
      throw error;
    }
  };

  return { requestPlanPurchase };
};
