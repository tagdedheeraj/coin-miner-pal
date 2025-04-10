
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { mapDbToUser } from '@/utils/supabaseUtils';
import { mockUsers } from '@/data/mockUsers';

export const createAuthenticationService = (
  user: User | null, 
  setUser: Dispatch<SetStateAction<User | null>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  
  const signIn = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Check for admin/mock users first before trying Supabase
      const mockUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (mockUser) {
        // Convert mock user to User type
        const userObj: User = {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          coins: mockUser.coins,
          referralCode: mockUser.referralCode,
          hasSetupPin: mockUser.hasSetupPin,
          hasBiometrics: mockUser.hasBiometrics,
          withdrawalAddress: mockUser.withdrawalAddress,
          appliedReferralCode: mockUser.appliedReferralCode,
          usdtEarnings: mockUser.usdtEarnings,
          notifications: mockUser.notifications || [],
          isAdmin: mockUser.isAdmin || false,
        };
        
        setUser(userObj);
        
        // Store in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(userObj));
        
        toast.success('Signed in successfully');
        setIsLoading(false);
        return;
      }
      
      // If not a mock user, proceed with Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Get user data from the database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (userError) {
        console.error('Error fetching user data:', userError);
        throw new Error('Failed to fetch user data');
      }
      
      if (!userData) {
        throw new Error('User profile not found');
      }
      
      // Map the user data and update local state
      const userObj = mapDbToUser(userData);
      
      setUser(userObj);
      
      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(userObj));
      
      toast.success('Signed in successfully');
    } catch (error) {
      console.error('Sign-in error:', error);
      
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
  
  const signOut = () => {
    supabase.auth.signOut().then(() => {
      localStorage.removeItem('user');
      setUser(null);
      toast.success('Signed out successfully');
    }).catch(error => {
      console.error('Sign-out error:', error);
      toast.error('Failed to sign out');
    });
  };
  
  return {
    signIn,
    signOut
  };
};
