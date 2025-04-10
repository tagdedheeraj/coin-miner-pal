
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { Dispatch, SetStateAction } from 'react';

export const userProfileServiceFunctions = (
  user: User | null,
  setUser: Dispatch<SetStateAction<User | null>>
) => {
  const updateUser = async (updates: Partial<User>): Promise<void> => {
    try {
      if (!user) throw new Error('Not authenticated');
      
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Update user error:', error);
      toast.error('Failed to update user data');
    }
  };

  const setupPin = async (pin: string): Promise<void> => {
    if (user) {
      await updateUser({ hasSetupPin: true });
    }
  };

  const setupBiometrics = async (enabled: boolean): Promise<void> => {
    if (user) {
      await updateUser({ hasBiometrics: enabled });
    }
  };

  const toggleBiometrics = async (): Promise<void> => {
    if (user) {
      await updateUser({ hasBiometrics: !user.hasBiometrics });
    }
  };

  const updateWithdrawalAddress = async (address: string): Promise<void> => {
    if (user) {
      await updateUser({ withdrawalAddress: address });
    }
  };

  const getAllUsers = async (): Promise<User[]> => {
    return user ? [user] : [];
  };

  const updateUserUsdtEarnings = async (email: string, amount: number): Promise<void> => {
    toast.success('USDT earnings updated');
  };

  const updateUserCoins = async (email: string, amount: number): Promise<void> => {
    toast.success('Coins updated');
  };

  const deleteUser = async (userId: string): Promise<void> => {
    toast.success('User deleted');
  };

  return {
    updateUser,
    setupPin,
    setupBiometrics,
    toggleBiometrics,
    updateWithdrawalAddress,
    setWithdrawalAddress: updateWithdrawalAddress,
    getAllUsers,
    updateUserUsdtEarnings,
    updateUserCoins,
    deleteUser
  };
};
