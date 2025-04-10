
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { mapUserToDb, mapDbToUser } from '@/utils/supabaseUtils';

export const referralServiceFunctions = (
  user: User | null,
  setUser: Dispatch<SetStateAction<User | null>>
) => {
  
  const applyReferralCode = async (code: string): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    if (user.isAdmin) throw new Error('Admin cannot apply referral code');
    
    try {
      // Check if user has already applied a referral code
      if (user.appliedReferralCode) {
        throw new Error('You have already applied a referral code');
      }
      
      // Validate referral code
      if (code === user.referralCode) {
        throw new Error('You cannot use your own referral code');
      }
      
      // Find the user with the given referral code
      const { data: referrerData, error: referrerError } = await supabase
        .from('users')
        .select('*')
        .eq('referral_code', code)
        .single();
      
      if (referrerError || !referrerData) {
        throw new Error('Invalid referral code');
      }
      
      // Update the referrer's coins and add notification
      const referrer = mapDbToUser(referrerData);
      const referrerNotifications = referrer.notifications || [];
      
      const { error: updateError } = await supabase
        .from('users')
        .update(mapUserToDb({
          coins: (referrer.coins || 0) + 250,
          notifications: [
            ...referrerNotifications,
            {
              id: uuidv4(),
              message: `${user.name} used your referral code! You received 250 bonus coins.`,
              read: false,
              createdAt: new Date().toISOString()
            }
          ]
        }))
        .eq('id', referrer.id);
      
      if (updateError) throw updateError;
      
      // Update current user with applied referral code
      const { error } = await supabase
        .from('users')
        .update(mapUserToDb({ 
          appliedReferralCode: code 
        }))
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update user state
      setUser({
        ...user,
        appliedReferralCode: code
      });
      
      toast.success('Referral code applied successfully!');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to apply referral code');
      throw error;
    }
  };
  
  return {
    applyReferralCode
  };
};
