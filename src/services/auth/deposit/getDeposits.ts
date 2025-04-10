
import { User, DepositRequest } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { mapDbToDeposit } from '@/utils/supabaseUtils';

export const getDepositFunctions = (user: User | null) => {
  const getDepositRequests = async (): Promise<DepositRequest[]> => {
    if (!user?.isAdmin) {
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('deposit_requests')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) {
        console.error('Error fetching deposit requests:', error);
        throw error;
      }
      
      return (data || []).map(item => mapDbToDeposit(item));
    } catch (error) {
      console.error('Failed to fetch deposit requests:', error);
      toast.error('Failed to fetch deposit requests');
      return [];
    }
  };

  // Function to get deposit requests for a specific user (non-admin)
  const getUserDepositRequests = async (): Promise<DepositRequest[]> => {
    if (!user) {
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('deposit_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });
      
      if (error) {
        console.error('Error fetching user deposit requests:', error);
        // Return empty array instead of throwing to avoid UI errors
        return [];
      }
      
      return (data || []).map(item => mapDbToDeposit(item));
    } catch (error) {
      console.error('Failed to fetch user deposit requests:', error);
      // Don't show toast to avoid spamming the user
      return [];
    }
  };

  return { 
    getDepositRequests,
    getUserDepositRequests
  };
};
