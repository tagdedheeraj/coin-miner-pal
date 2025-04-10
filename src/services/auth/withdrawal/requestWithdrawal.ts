
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { mapWithdrawalToDb, mapUserToDb } from '@/utils/supabaseUtils';

export const createWithdrawalRequestFunctions = (
  user: User | null,
  setUser: Dispatch<SetStateAction<User | null>>
) => {
  const requestWithdrawal = async (amount: number): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    if (user.isAdmin) throw new Error('Admin cannot request withdrawals');
    
    if (!user.withdrawalAddress) {
      throw new Error('Please set a withdrawal address first');
    }
    
    try {
      // Calculate available USDT balance
      const availableBalance = user.usdtEarnings || 0;
      
      if (amount > availableBalance) {
        throw new Error('Insufficient balance');
      }
      
      if (amount < 50) {
        throw new Error('Minimum withdrawal amount is $50');
      }
      
      // Create withdrawal request in Supabase
      const withdrawalRequest = mapWithdrawalToDb({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        amount,
        address: user.withdrawalAddress,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      
      const { error } = await supabase
        .from('withdrawal_requests')
        .insert([withdrawalRequest]);
      
      if (error) throw error;
      
      // Create notification for user
      const notification = {
        id: uuidv4(),
        message: `Your withdrawal request for $${amount.toFixed(2)} USDT has been submitted and is awaiting approval.`,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      // Update user notifications
      const userNotifications = user.notifications || [];
      await supabase
        .from('users')
        .update(mapUserToDb({
          notifications: [...userNotifications, notification]
        }))
        .eq('id', user.id);
      
      // Update local user state
      setUser({
        ...user,
        notifications: [...userNotifications, notification]
      });
      
      toast.success('Withdrawal request submitted successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to request withdrawal');
      throw error;
    }
  };

  return { requestWithdrawal };
};
