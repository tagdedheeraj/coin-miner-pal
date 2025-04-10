
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
      // Check if user already exists with this email
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email);
      
      if (checkError) {
        console.error('Error checking for existing user:', checkError);
        throw new Error('Failed to check for existing user. Please try again.');
      } else if (existingUsers && existingUsers.length > 0) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }
      
      // Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: window.location.origin + '/auth/callback'
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
        .insert(userDbData as any);
      
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
      
      // Check if user's email is confirmed or if confirmation is required
      if (data.user.email_confirmed_at) {
        // Email already confirmed (if using development settings)
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        toast.success('Account created successfully! You received 200 coins as a signup bonus.');
      } else {
        // Email confirmation is required
        toast.success('Account created! Please check your email to verify your account.');
        // Don't set the user yet until they confirm their email
      }
      
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
      // Make sure to reset loading state regardless of outcome
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async (email: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: window.location.origin + '/auth/callback'
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast.success('Verification email sent. Please check your inbox.');
    } catch (error) {
      console.error('Error sending verification email:', error);
      let errorMessage = 'Failed to send verification email';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      throw error;
    }
  };
  
  return {
    signUp,
    resendVerificationEmail
  };
};
