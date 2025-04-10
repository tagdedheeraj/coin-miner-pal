
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { mapWithdrawalToDb, mapDbToUser, mapUserToDb } from '@/utils/supabaseUtils';

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
      
      const request = mapDbToUser(requestData);
      
      if (!request || request.status !== 'pending') {
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
        .eq('email', request.userEmail || '')
        .single();
      
      if (userError) throw new Error('User not found');
      if (!userData) throw new Error('User data is empty');
      
      const targetUser = mapDbToUser(userData);
      const currentEarnings = targetUser.usdtEarnings || 0;
      const userNotifications = targetUser.notifications || [];
      
      await supabase
        .from('users')
        .update(mapUserToDb({
          usdtEarnings: currentEarnings - (request.amount || 0),
          notifications: [
            ...userNotifications,
            {
              id: uuidv4(),
              message: `Your withdrawal request for $${(request.amount || 0).toFixed(2)} USDT has been approved and processed.`,
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

  return { approveWithdrawalRequest };
};
