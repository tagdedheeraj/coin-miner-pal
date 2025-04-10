
import { User, DepositRequest } from '@/types/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export const depositServiceFunctions = (user: User | null) => {

  const requestPlanPurchase = async (depositData: Omit<DepositRequest, 'id' | 'status' | 'reviewedAt'>): Promise<void> => {
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    try {
      // Create the deposit request
      const depositRequest: Omit<DepositRequest, 'id'> = {
        ...depositData,
        status: 'pending',
      };
      
      // Save to Supabase
      const { error } = await supabase
        .from('depositRequests')
        .insert([depositRequest]);
      
      if (error) throw error;
      
      // Add notification to user
      const notification = {
        id: uuidv4(),
        message: `Your deposit for ${depositData.planName} of $${depositData.amount} is being reviewed.`,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      // Get current user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (userError) throw userError;
      
      // Update user document with notification
      const userNotifications = userData.notifications || [];
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          notifications: [...userNotifications, notification]
        })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      toast.success('Deposit request submitted successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit deposit request');
      throw error;
    }
  };
  
  const getDepositRequests = async (): Promise<DepositRequest[]> => {
    if (!user?.isAdmin) {
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('depositRequests')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch deposit requests');
      return [];
    }
  };
  
  const approveDepositRequest = async (requestId: string): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can approve deposit requests');
      return;
    }
    
    try {
      // Get the deposit request
      const { data: requestData, error: requestError } = await supabase
        .from('depositRequests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (requestError) throw new Error('Deposit request not found');
      
      const request = requestData;
      
      if (request.status !== 'pending') {
        throw new Error('This request has already been processed');
      }
      
      // Update request status
      const { error: updateError } = await supabase
        .from('depositRequests')
        .update({
          status: 'approved',
          reviewedAt: new Date().toISOString()
        })
        .eq('id', requestId);
      
      if (updateError) throw updateError;
      
      // Find the user and send notification
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', request.userEmail)
        .single();
      
      if (userError) throw new Error('User not found');
      
      const targetUser = userData as User;
      const userNotifications = targetUser.notifications || [];
      
      const { error } = await supabase
        .from('users')
        .update({
          notifications: [
            ...userNotifications,
            {
              id: uuidv4(),
              message: `Your deposit for ${request.planName} has been approved! Your plan is now active.`,
              read: false,
              createdAt: new Date().toISOString()
            }
          ]
        })
        .eq('id', targetUser.id);
      
      if (error) throw error;
      
      toast.success('Deposit request approved successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to approve deposit request');
    }
  };
  
  const rejectDepositRequest = async (requestId: string): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can reject deposit requests');
      return;
    }
    
    try {
      // Get the deposit request
      const { data: requestData, error: requestError } = await supabase
        .from('depositRequests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (requestError) throw new Error('Deposit request not found');
      
      const request = requestData;
      
      if (request.status !== 'pending') {
        throw new Error('This request has already been processed');
      }
      
      // Update request status
      const { error: updateError } = await supabase
        .from('depositRequests')
        .update({
          status: 'rejected',
          reviewedAt: new Date().toISOString()
        })
        .eq('id', requestId);
      
      if (updateError) throw updateError;
      
      // Find the user and send notification
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', request.userEmail)
        .single();
      
      if (userError) throw new Error('User not found');
      
      const targetUser = userData as User;
      const userNotifications = targetUser.notifications || [];
      
      const { error } = await supabase
        .from('users')
        .update({
          notifications: [
            ...userNotifications,
            {
              id: uuidv4(),
              message: `Your deposit for ${request.planName} has been rejected. Please contact support for more information.`,
              read: false,
              createdAt: new Date().toISOString()
            }
          ]
        })
        .eq('id', targetUser.id);
      
      if (error) throw error;
      
      toast.success('Deposit request rejected successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to reject deposit request');
    }
  };
  
  return {
    requestPlanPurchase,
    getDepositRequests,
    approveDepositRequest,
    rejectDepositRequest
  };
};
