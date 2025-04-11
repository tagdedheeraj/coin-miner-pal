import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { getFirestore, doc, updateDoc, getDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { mapUserToDb } from '@/utils/firebaseUtils';

export const userServiceFunctions = (
  user: User | null, 
  setUser: Dispatch<SetStateAction<User | null>>
) => {
  const db = getFirestore();
  
  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, ...updates };
      
      // Update in Firestore
      const userRef = doc(db, 'users', user.id);
      
      // Convert to Firestore format using our utility function
      const firestoreUpdates = mapUserToDb(updates);
      
      console.log('Updating user with data:', firestoreUpdates);
      
      await updateDoc(userRef, firestoreUpdates);
      
      // Update localStorage for persistence
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      console.log('User updated successfully:', updatedUser);
    } catch (error) {
      console.error('Failed to update user data:', error);
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
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
      
      toast.success('User deleted successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete user');
    }
  };

  const fetchUserBySupabaseId = async (firebaseId: string): Promise<User | null> => {
    try {
      const userRef = doc(db, 'users', firebaseId);
      const userSnapshot = await getDoc(userRef);
      
      if (!userSnapshot.exists()) return null;
      
      const data = userSnapshot.data();
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        coins: data.coins,
        referralCode: data.referral_code,
        hasSetupPin: data.has_setup_pin,
        hasBiometrics: data.has_biometrics,
        withdrawalAddress: data.withdrawal_address,
        appliedReferralCode: data.applied_referral_code,
        usdtEarnings: data.usdt_earnings,
        notifications: data.notifications,
        isAdmin: data.is_admin
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  };

  const findUserByEmail = async (email: string): Promise<{userId: string, userData: User} | null> => {
    try {
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('email', '==', email));
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) return null;
      
      const userDoc = userSnapshot.docs[0];
      const data = userDoc.data();
      
      return { 
        userId: userDoc.id, 
        userData: {
          id: data.id,
          name: data.name,
          email: data.email,
          coins: data.coins,
          referralCode: data.referral_code,
          hasSetupPin: data.has_setup_pin,
          hasBiometrics: data.has_biometrics,
          withdrawalAddress: data.withdrawal_address,
          appliedReferralCode: data.applied_referral_code,
          usdtEarnings: data.usdt_earnings,
          notifications: data.notifications,
          isAdmin: data.is_admin
        }
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
