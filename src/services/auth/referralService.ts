
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { Dispatch, SetStateAction } from 'react';

export const referralServiceFunctions = (
  user: User | null,
  setUser: Dispatch<SetStateAction<User | null>>
) => {
  const applyReferralCode = async (code: string): Promise<void> => {
    if (!user) {
      toast.error('You must be logged in to apply a referral code');
      return;
    }
    
    if (user.appliedReferralCode) {
      toast.error('You have already applied a referral code');
      return;
    }
    
    try {
      // In a real app, you would validate the referral code and award coins
      setUser({
        ...user,
        appliedReferralCode: code
      });
      
      toast.success('Referral code applied successfully');
    } catch (error) {
      console.error('Error applying referral code:', error);
      toast.error('Failed to apply referral code');
    }
  };

  return {
    applyReferralCode
  };
};
