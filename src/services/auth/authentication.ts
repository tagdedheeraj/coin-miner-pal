
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SupabaseUserCredential } from '@/contexts/auth/types';
import { generateReferralCode } from '@/utils/referral';
import { mapUserToDb, mapDbToUser } from '@/utils/supabaseUtils';

// Admin credentials
const ADMIN_EMAIL = 'admin@infinium.com';
const ADMIN_PASSWORD = 'Infinium@123';

export const createAuthenticationService = (
  user: User | null, 
  setUser: Dispatch<SetStateAction<User | null>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Check if this is an admin login
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Create admin user object
        const adminUser = {
          id: 'admin-id',
          name: 'Admin',
          email: ADMIN_EMAIL,
          coins: 0,
          referralCode: '',
          hasSetupPin: true,
          hasBiometrics: false,
          withdrawalAddress: null,
          appliedReferralCode: null,
          notifications: [],
          isAdmin: true
        };
        
        // Store admin user in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(adminUser));
        
        setUser(adminUser);
        toast.success('Signed in as Admin');
        return;
      }
      
      console.log('Attempting to sign in with Supabase');
      // Regular user login with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw new Error(error.message);
      
      // Get user profile from Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        // If profile doesn't exist, create a basic one
        if (profileError.code === 'PGRST116') {
          const newUser: User = {
            id: data.user.id,
            name: email.split('@')[0],
            email: email,
            coins: 0,
            referralCode: generateReferralCode(),
            hasSetupPin: false,
            hasBiometrics: false,
            withdrawalAddress: null,
          };
          
          // Create profile in Supabase
          const { error: insertError } = await supabase
            .from('users')
            .insert([mapUserToDb(newUser)]);
          
          if (insertError) {
            console.error("Failed to create user profile:", insertError);
            toast.error("Account created but profile setup failed. Please contact support.");
          }
          
          // Store in localStorage
          localStorage.setItem('user', JSON.stringify(newUser));
          setUser(newUser);
        } else {
          throw new Error(profileError.message);
        }
      } else {
        // Use existing profile
        const userData = mapDbToUser(profileData);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
      
      toast.success('Signed in successfully');
    } catch (error) {
      console.error('Sign in error:', error);
      
      let errorMessage = 'Failed to sign in';
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

  const signOut = async () => {
    try {
      // Only sign out from Supabase if not admin
      if (user && !user.isAdmin) {
        await supabase.auth.signOut();
      }
      setUser(null);
      localStorage.removeItem('user');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to sign out');
    }
  };
  
  return {
    signIn,
    signOut,
  };
};
