
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
      
      if (error) throw error;
      
      return (data || []).map(item => mapDbToDeposit(item));
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch deposit requests');
      return [];
    }
  };

  return { getDepositRequests };
};
