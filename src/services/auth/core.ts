
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { SupabaseUserCredential } from '@/contexts/auth/types';
import { generateReferralCode } from '@/utils/referral';

// Admin credentials
const ADMIN_EMAIL = 'admin@infinium.com';
const ADMIN_PASSWORD = 'Infinium@123';

export const coreAuthFunctions = (
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
          const { error: insertError } = await supabase.from('users').insert([newUser]);
          
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
        const userData: User = profileData;
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
      const { error: insertError } = await supabase
        .from('users')
        .insert([newUser]);
      
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

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error('Not authenticated');
    if (user.isAdmin) throw new Error('Admin password cannot be changed');
    
    try {
      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });
      
      if (signInError) throw new Error('Current password is incorrect');
      
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success('Password changed successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
      throw error;
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    changePassword,
  };
};
