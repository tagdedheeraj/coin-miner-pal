
import { User, WithdrawalRequest } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { mapDbToWithdrawal } from '@/utils/supabaseUtils';

export const getWithdrawalFunctions = (user: User | null) => {
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

  return { getWithdrawalRequests };
};
