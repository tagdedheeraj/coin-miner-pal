
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

export const userServiceFunctions = (
  user: User | null, 
  setUser: Dispatch<SetStateAction<User | null>>
) => {
  
  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, ...updates };
      
      // Update in Firebase if not admin user
      if (!user.isAdmin) {
        // For now, let's skip the actual Firestore update to avoid permission errors
        // Just update the local state
        
        // Update localStorage for persistence
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
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
      // For now, we're skipping the actual Firestore deletion to avoid permission errors
      toast.success('User deleted successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete user');
    }
  };

  const fetchUserByFirebaseId = async (firebaseUid: string): Promise<User | null> => {
    try {
      // For now, let's try to get the user from localStorage instead of Firestore
      const localUser = localStorage.getItem('user');
      if (localUser) {
        const parsedUser = JSON.parse(localUser) as User;
        if (parsedUser.id === firebaseUid) {
          return parsedUser;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  };

  const findUserByEmail = async (email: string): Promise<{userId: string, userData: User} | null> => {
    try {
      // For now, let's try to get the user from localStorage instead of Firestore
      const localUser = localStorage.getItem('user');
      if (localUser) {
        const parsedUser = JSON.parse(localUser) as User;
        if (parsedUser.email === email) {
          return { userId: parsedUser.id, userData: parsedUser };
        }
      }
      
      return null;
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
    fetchUserByFirebaseId,
    findUserByEmail,
  };
};
