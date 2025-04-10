
import { Dispatch, SetStateAction } from 'react';
import { User, DepositRequest } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { mapDepositToDb, mapDbToDeposit, mapUserToDb, mapDbToUser } from '@/utils/supabaseUtils';

export const depositServiceFunctions = (
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
      
      // Save to Supabase
      const { error } = await supabase
        .from('deposit_requests')
        .insert([depositRequest]);
      
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
      const { error: updateError } = await supabase
        .from('users')
        .update(mapUserToDb({
          notifications: [...userNotifications, notification]
        }))
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

  const getDepositRequests = async (): Promise<DepositRequest[]> => {
    if (!user?.isAdmin) {
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('deposit_requests')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(item => mapDbToDeposit(item));
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
      await supabase
        .from('deposit_requests')
        .update(mapDepositToDb({
          status: 'approved',
          reviewedAt: new Date().toISOString()
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
              message: `Your deposit for ${request.planName} has been approved! Your plan is now active.`,
              read: false,
              createdAt: new Date().toISOString()
            }
          ]
        }))
        .eq('id', targetUser.id);
      
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
      await supabase
        .from('deposit_requests')
        .update(mapDepositToDb({
          status: 'rejected',
          reviewedAt: new Date().toISOString()
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
              message: `Your deposit for ${request.planName} has been rejected. Please contact support for more information.`,
              read: false,
              createdAt: new Date().toISOString()
            }
          ]
        }))
        .eq('id', targetUser.id);
      
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
