
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { auth } from '@/integrations/firebase/client';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { toast } from 'sonner';
import { generateReferralCode } from '@/utils/referral';
import { supabase } from '@/integrations/supabase/client';
import { mapUserToDb } from '@/utils/supabaseUtils';

export const createRegistrationService = (
  user: User | null, 
  setUser: Dispatch<SetStateAction<User | null>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  
  const signUp = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    console.log('Attempting to sign up with Firebase');
    
    try {
      // Register with Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update the user profile with their name
      await updateProfile(firebaseUser, {
        displayName: name
      });
      
      console.log('Firebase signup successful, creating user profile...');
      
      // Generate referral code
      const referralCode = generateReferralCode();
      
      // Create user profile
      const newUser: User = {
        id: firebaseUser.uid,
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
      
      // Map the user object for Supabase - ensure it has all required fields
      const supabaseUserData = mapUserToDb({
        ...newUser,
        isAdmin: false
      });
      
      console.log('Supabase user data:', supabaseUserData);
      
      // Ensure we have all required fields for the users table
      if (!supabaseUserData.id || !supabaseUserData.email || 
          !supabaseUserData.name || !supabaseUserData.referral_code) {
        throw new Error('Missing required user fields for Supabase');
      }
      
      // Also save to Supabase for admin panel visibility
      const { error: supabaseError } = await supabase
        .from('users')
        .insert(supabaseUserData);
      
      if (supabaseError) {
        console.error('Failed to save user to Supabase:', supabaseError);
        // Continue anyway since Firebase auth is successful
      } else {
        console.log('User successfully saved to Supabase');
      }
      
      // Save in local state
      setUser(newUser);
      
      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(newUser));
      
      toast.success('Account created successfully! You received 200 coins as a signup bonus.');
      
      // Return the user credential
      return userCredential;
    } catch (error) {
      console.error('Signup process error:', error);
      
      let errorMessage = 'Failed to sign up';
      if (error instanceof Error) {
        if (error.message.includes('auth/email-already-in-use')) {
          errorMessage = 'This email is already registered. Please sign in instead.';
        } else if (error.message.includes('auth/network-request-failed')) {
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
