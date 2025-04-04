
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
        const userDocRef = doc(db, 'users', user.id);
        
        // Remove id field as it's not stored in Firestore
        const { id, ...userDataWithoutId } = updatedUser;
        await updateDoc(userDocRef, userDataWithoutId);
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
      // Delete user document from Firestore
      await deleteDoc(doc(db, 'users', userId));
      
      // Note: This doesn't delete the user from Firebase Auth
      // In a production environment, you would use Firebase Admin SDK to delete the user
      
      toast.success('User deleted successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete user');
    }
  };

  const fetchUserByFirebaseId = async (firebaseUid: string): Promise<User | null> => {
    try {
      const userDocRef = doc(db, 'users', firebaseUid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as Omit<User, 'id'>;
        return {
          id: firebaseUid,
          ...userData
        };
      }
      return null;
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
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const userDoc = querySnapshot.docs[0];
      const userId = userDoc.id;
      const userData = userDoc.data() as User;
      
      return { userId, userData: { ...userData, id: userId } };
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
