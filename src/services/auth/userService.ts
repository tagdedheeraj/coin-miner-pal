
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { db } from '@/integrations/firebase/client';
import { doc, updateDoc, deleteDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';

export const userServiceFunctions = (
  user: User | null, 
  setUser: Dispatch<SetStateAction<User | null>>
) => {
  
  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, ...updates };
      
      // Update in Firestore if not admin user
      if (!user.isAdmin) {
        const userRef = doc(db, 'users', user.id);
        
        // Convert user updates to Firestore format
        const firestoreUpdates: Record<string, any> = {};
        
        if ('name' in updates) firestoreUpdates.name = updates.name;
        if ('email' in updates) firestoreUpdates.email = updates.email;
        if ('coins' in updates) firestoreUpdates.coins = updates.coins;
        if ('referralCode' in updates) firestoreUpdates.referral_code = updates.referralCode;
        if ('hasSetupPin' in updates) firestoreUpdates.has_setup_pin = updates.hasSetupPin;
        if ('hasBiometrics' in updates) firestoreUpdates.has_biometrics = updates.hasBiometrics;
        if ('withdrawalAddress' in updates) firestoreUpdates.withdrawal_address = updates.withdrawalAddress;
        if ('appliedReferralCode' in updates) firestoreUpdates.applied_referral_code = updates.appliedReferralCode;
        if ('usdtEarnings' in updates) firestoreUpdates.usdt_earnings = updates.usdtEarnings;
        if ('notifications' in updates) firestoreUpdates.notifications = updates.notifications;
        if ('isAdmin' in updates) firestoreUpdates.is_admin = updates.isAdmin;
        
        await updateDoc(userRef, firestoreUpdates);
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
      await deleteDoc(doc(db, 'users', userId));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete user');
    }
  };

  const fetchUserByFirebaseId = async (firebaseId: string): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseId));
      
      if (!userDoc.exists()) return null;
      
      const data = userDoc.data();
      return {
        id: firebaseId,
        name: data.name,
        email: data.email,
        coins: data.coins,
        referralCode: data.referral_code,
        hasSetupPin: data.has_setup_pin,
        hasBiometrics: data.has_biometrics,
        withdrawalAddress: data.withdrawal_address,
        appliedReferralCode: data.applied_referral_code,
        usdtEarnings: data.usdt_earnings,
        notifications: data.notifications || [],
        isAdmin: data.is_admin || false
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  };

  const findUserByEmail = async (email: string): Promise<{userId: string, userData: User} | null> => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return null;
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      const userData: User = {
        id: doc.id,
        name: data.name,
        email: data.email,
        coins: data.coins,
        referralCode: data.referral_code,
        hasSetupPin: data.has_setup_pin,
        hasBiometrics: data.has_biometrics,
        withdrawalAddress: data.withdrawal_address,
        appliedReferralCode: data.applied_referral_code,
        usdtEarnings: data.usdt_earnings,
        notifications: data.notifications || [],
        isAdmin: data.is_admin || false
      };
      
      return { 
        userId: doc.id, 
        userData 
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
    fetchUserByFirebaseId,
    findUserByEmail,
  };
};
