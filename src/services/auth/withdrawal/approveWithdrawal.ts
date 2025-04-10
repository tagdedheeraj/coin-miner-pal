
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { User, WithdrawalRequest } from '@/types/auth';
import { mapWithdrawalToDb, mapUserToDb, mapDbToUser, mapDbToWithdrawal } from '@/utils/supabaseUtils';

export const approveWithdrawalFunctions = (user: User | null) => {
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
      const updateData = mapWithdrawalToDb({
        status: 'approved',
        updatedAt: new Date().toISOString()
      });
      
      await supabase
        .from('withdrawal_requests')
        .update(updateData as any)
        .eq('id', requestId);
      
      // Find the user and update their balance
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', request.userEmail)
        .single();
      
      if (userError) throw new Error('User not found');
      if (!userData) throw new Error('User data is empty');
      
      const targetUser = mapDbToUser(userData);
      const userNotifications = targetUser.notifications || [];
      const currentBalance = targetUser.usdtEarnings || 0;
      
      // Ensure balance is sufficient
      if (request.amount > currentBalance) {
        throw new Error(`User has insufficient balance: ${currentBalance} < ${request.amount}`);
      }
      
      // Update user balance
      const newBalance = currentBalance - request.amount;
      const userUpdate = mapUserToDb({
        usdtEarnings: newBalance,
        notifications: [
          ...userNotifications,
          {
            id: uuidv4(),
            message: `Your withdrawal request for $${request.amount.toFixed(2)} USDT has been approved and processed.`,
            read: false,
            createdAt: new Date().toISOString()
          }
        ]
      });
      
      await supabase
        .from('users')
        .update(userUpdate as any)
        .eq('id', targetUser.id);
      
      toast.success('Withdrawal request approved successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to approve withdrawal request');
    }
  };

  return { approveWithdrawalRequest };
};
