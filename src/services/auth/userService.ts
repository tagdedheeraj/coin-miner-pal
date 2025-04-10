
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const userServiceFunctions = (
  user: User | null, 
  setUser: Dispatch<SetStateAction<User | null>>
) => {
  
  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, ...updates };
      
      // Update in Supabase if not admin user
      if (!user.isAdmin) {
        const { error } = await supabase
          .from('users')
          .update(updates)
          .eq('id', user.id);
        
        if (error) throw error;
      }
      
      // Update localStorage for persistence
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update user data');
    }
  };

  const setupPin = async (pin: string) => {
    if (!user) throw new Error('Not authenticated');
    
    try {
      await updateUser({ hasSetupPin: true });
      toast.success('PIN set up successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to set up PIN');
      throw error;
    }
  };

  const toggleBiometrics = async () => {
    if (!user) throw new Error('Not authenticated');
    
    try {
      await updateUser({ hasBiometrics: !user.hasBiometrics });
      toast.success(user.hasBiometrics ? 'Biometrics disabled' : 'Biometrics enabled');
    } catch (error) {
      console.error(error);
      toast.error('Failed to toggle biometrics');
      throw error;
    }
  };

  const setWithdrawalAddress = async (address: string) => {
    if (!user) return;
    
    try {
      await updateUser({ withdrawalAddress: address });
      toast.success('Withdrawal address updated');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update withdrawal address');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!user?.isAdmin) {
      toast.error('Only admins can delete users');
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      toast.success('User deleted successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete user');
    }
  };

  const fetchUserBySupabaseId = async (supabaseId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseId)
        .single();
      
      if (error) return null;
      
      return data as User;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  };

  const findUserByEmail = async (email: string): Promise<{userId: string, userData: User} | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) return null;
      
      return { 
        userId: data.id, 
        userData: data as User 
      };
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  };
  
  return {
    updateUser,
    setupPin,
    toggleBiometrics,
    setWithdrawalAddress,
    deleteUser,
    fetchUserBySupabaseId,
    findUserByEmail,
  };
};
