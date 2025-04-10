
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SupabaseUserCredential } from '@/contexts/auth/types';
import { generateReferralCode } from '@/utils/referral';
import { mapUserToDb } from '@/utils/supabaseUtils';

export const createRegistrationService = (
  user: User | null, 
  setUser: Dispatch<SetStateAction<User | null>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  
  const signUp = async (name: string, email: string, password: string): Promise<SupabaseUserCredential> => {
    setIsLoading(true);
    console.log('Attempting to sign up with Supabase');
    
    try {
      // Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      
      if (error) {
        console.error('Supabase signup error:', error);
        throw new Error(error.message);
      }
      
      if (!data.user) {
        throw new Error('Failed to create user account. Please try again later.');
      }
      
      console.log('Supabase signup successful, creating user profile...');
      
      // Generate referral code
      const referralCode = generateReferralCode();
      
      // Create user profile
      const newUser: User = {
        id: data.user.id,
        name,
        email,
        coins: 200, // Sign-up bonus
        referralCode,
        hasSetupPin: false,
        hasBiometrics: false,
        withdrawalAddress: null,
        usdtEarnings: 0,
        notifications: []
      };
      
      // Store in Supabase
      console.log('Creating user profile in Supabase');
      
      const userDbData = mapUserToDb(newUser);
      
      const { error: insertError } = await supabase
        .from('users')
        .insert([userDbData]);
      
      if (insertError) {
        console.error('User profile creation error:', insertError);
        
        // Even if profile creation fails, still set the user in local state
        // This will allow the user to proceed and we can try to create the profile later
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        // Warn but don't block the flow
        toast.warning('Account created but profile sync may be incomplete. Please complete setup later.');
        
        return data as SupabaseUserCredential;
      }
      
      // Save in local state
      setUser(newUser);
      
      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(newUser));
      
      toast.success('Account created successfully! You received 200 coins as a signup bonus.');
      
      // Return the data in the expected format
      return data as SupabaseUserCredential;
    } catch (error) {
      console.error('Signup process error:', error);
      
      let errorMessage = 'Failed to sign up';
      if (error instanceof Error) {
        if (error.message.includes('fetch') || 
            error.message.includes('network') || 
            error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    signUp
  };
};
