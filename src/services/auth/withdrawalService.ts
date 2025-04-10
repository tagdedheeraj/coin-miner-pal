
import { Dispatch, SetStateAction } from 'react';
import { User, WithdrawalRequest } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { mapWithdrawalToDb, mapDbToWithdrawal, mapUserToDb, mapDbToUser } from '@/utils/supabaseUtils';

export const withdrawalServiceFunctions = (
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

  const getWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
    if (!user?.isAdmin) {
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(item => mapDbToWithdrawal(item));
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch withdrawal requests');
      return [];
    }
  };

  const approveWithdrawalRequest = async (requestId: string): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can approve withdrawal requests');
      return;
    }
    
    try {
      // Get the withdrawal request
      const { data: requestData, error: requestError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (requestError) throw new Error('Withdrawal request not found');
      if (!requestData) throw new Error('Withdrawal request data is empty');
      
      const request = mapDbToWithdrawal(requestData);
      
      if (request.status !== 'pending') {
        throw new Error('This request has already been processed');
      }
      
      // Update request status
      await supabase
        .from('withdrawal_requests')
        .update(mapWithdrawalToDb({
          status: 'approved',
          updatedAt: new Date().toISOString()
        }))
        .eq('id', requestId);
      
      // Find the user and update their USDT earnings
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', request.userEmail)
        .single();
      
      if (userError) throw new Error('User not found');
      if (!userData) throw new Error('User data is empty');
      
      const targetUser = mapDbToUser(userData);
      const currentEarnings = targetUser.usdtEarnings || 0;
      const userNotifications = targetUser.notifications || [];
      
      await supabase
        .from('users')
        .update(mapUserToDb({
          usdtEarnings: currentEarnings - request.amount,
          notifications: [
            ...userNotifications,
            {
              id: uuidv4(),
              message: `Your withdrawal request for $${request.amount.toFixed(2)} USDT has been approved and processed.`,
              read: false,
              createdAt: new Date().toISOString()
            }
          ]
        }))
        .eq('id', targetUser.id);
      
      toast.success('Withdrawal request approved successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to approve withdrawal request');
    }
  };

  const rejectWithdrawalRequest = async (requestId: string): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can reject withdrawal requests');
      return;
    }
    
    try {
      // Get the withdrawal request
      const { data: requestData, error: requestError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (requestError) throw new Error('Withdrawal request not found');
      if (!requestData) throw new Error('Withdrawal request data is empty');
      
      const request = mapDbToWithdrawal(requestData);
      
      if (request.status !== 'pending') {
        throw new Error('This request has already been processed');
      }
      
      // Update request status
      await supabase
        .from('withdrawal_requests')
        .update(mapWithdrawalToDb({
          status: 'rejected',
          updatedAt: new Date().toISOString()
        }))
        .eq('id', requestId);
      
      // Find the user and send notification
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', request.userEmail)
        .single();
      
      if (userError) throw new Error('User not found');
      if (!userData) throw new Error('User data is empty');
      
      const targetUser = mapDbToUser(userData);
      const userNotifications = targetUser.notifications || [];
      
      await supabase
        .from('users')
        .update(mapUserToDb({
          notifications: [
            ...userNotifications,
            {
              id: uuidv4(),
              message: `Your withdrawal request for $${request.amount.toFixed(2)} USDT has been rejected. Please contact support for more information.`,
              read: false,
              createdAt: new Date().toISOString()
            }
          ]
        }))
        .eq('id', targetUser.id);
      
      toast.success('Withdrawal request rejected successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to reject withdrawal request');
    }
  };
  
  return {
    requestWithdrawal,
    getWithdrawalRequests,
    approveWithdrawalRequest,
    rejectWithdrawalRequest
  };
};
