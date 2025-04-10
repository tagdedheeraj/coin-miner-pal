
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
      // Instead of trying to create a user record (which fails due to RLS),
      // we'll just create the deposit request directly
      
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
        
        // If there's a foreign key constraint error, provide a clearer message
        if (error.message.includes('violates foreign key constraint')) {
          throw new Error('Unable to create deposit request. Please try again or contact support.');
        }
        
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
