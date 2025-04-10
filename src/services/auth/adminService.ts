
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { mapUserToDb, mapDbToUser } from '@/utils/supabaseUtils';

export const adminServiceFunctions = (user: User | null) => {

  const updateUserUsdtEarnings = async (email: string, amount: number): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can update USDT earnings');
      return;
    }

    try {
      // Find the user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (userError) throw new Error('User not found');
      
      const targetUser = mapDbToUser(userData);
      const userNotifications = targetUser.notifications || [];
      
      // Update USDT earnings and add notification
      const { error } = await supabase
        .from('users')
        .update(mapUserToDb({
          usdtEarnings: amount,
          notifications: [
            ...userNotifications,
            {
              id: Date.now().toString(),
              message: `Your USDT earnings have been updated from ${targetUser.usdtEarnings || 0} to ${amount} by admin.`,
              read: false,
              createdAt: new Date().toISOString()
            }
          ]
        }))
        .eq('id', targetUser.id);
        
      if (error) throw error;
      
      toast.success(`USDT earnings updated for ${email}`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to update USDT earnings');
      throw error;
    }
  };

  const updateUserCoins = async (email: string, amount: number): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can update user coins');
      return;
    }

    try {
      // Find the user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (userError) throw new Error('User not found');
      
      const targetUser = mapDbToUser(userData);
      const userNotifications = targetUser.notifications || [];
      
      // Update coins and add notification
      const { error } = await supabase
        .from('users')
        .update(mapUserToDb({
          coins: amount,
          notifications: [
            ...userNotifications,
            {
              id: Date.now().toString(),
              message: `Your coin balance has been updated from ${targetUser.coins} to ${amount} by admin.`,
              read: false,
              createdAt: new Date().toISOString()
            }
          ]
        }))
        .eq('id', targetUser.id);
        
      if (error) throw error;
      
      toast.success(`Coins updated for ${email}`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to update coins');
      throw error;
    }
  };
  
  return {
    updateUserUsdtEarnings,
    updateUserCoins
  };
};
