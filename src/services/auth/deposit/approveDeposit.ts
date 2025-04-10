
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { mapDepositToDb, mapDbToUser, mapUserToDb, mapDbToDeposit } from '@/utils/supabaseUtils';

export const approveDepositFunctions = (user: User | null) => {
  const approveDepositRequest = async (requestId: string): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can approve deposit requests');
      return;
    }
    
    try {
      // Get the deposit request
      const { data: requestData, error: requestError } = await supabase
        .from('deposit_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (requestError) throw new Error('Deposit request not found');
      if (!requestData) throw new Error('Deposit request data is empty');
      
      const request = mapDbToDeposit(requestData);
      
      if (request.status !== 'pending') {
        throw new Error('This request has already been processed');
      }
      
      // Update request status
      const updateData = mapDepositToDb({
        status: 'approved',
        reviewedAt: new Date().toISOString()
      });
      
      await supabase
        .from('deposit_requests')
        .update(updateData as any)
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
      const newNotification = {
        id: uuidv4(),
        message: `Your deposit for ${request.planName} has been approved! Your plan is now active.`,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      const userUpdate = mapUserToDb({
        notifications: [...userNotifications, newNotification]
      });
      
      await supabase
        .from('users')
        .update(userUpdate as any)
        .eq('id', targetUser.id);
      
      toast.success('Deposit request approved successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to approve deposit request');
    }
  };

  return { approveDepositRequest };
};
