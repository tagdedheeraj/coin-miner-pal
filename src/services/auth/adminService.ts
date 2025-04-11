
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { auth } from '@/integrations/firebase/client';
import { deleteUser as deleteFirebaseUser } from 'firebase/auth';
import { collection, getDocs, query, where, getFirestore, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { mockUsers } from '@/data/mockUsers';

export const adminServiceFunctions = (user: User | null) => {
  // Initialize Firestore
  const db = getFirestore();
  const usersCollectionRef = collection(db, 'users');
  
  const getAllUsers = async (): Promise<User[]> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can access user list');
      return [];
    }

    try {
      console.log('Fetching all users from Firebase...');
      
      // Get users from Firebase
      const usersSnapshot = await getDocs(usersCollectionRef);
      const users: User[] = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          email: data.email || '',
          coins: data.coins || 0,
          referralCode: data.referralCode || '',
          hasSetupPin: data.hasSetupPin || false,
          hasBiometrics: data.hasBiometrics || false,
          withdrawalAddress: data.withdrawalAddress || null,
          appliedReferralCode: data.appliedReferralCode || undefined,
          usdtEarnings: data.usdtEarnings || 0,
          notifications: data.notifications || [],
          isAdmin: data.isAdmin || false
        };
      });
      
      // If no users found in Firebase, use mock data (for development)
      if (users.length === 0) {
        console.log('No users found in Firebase, using mock data');
        return mockUsers.map(mockUser => ({
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          coins: mockUser.coins,
          referralCode: mockUser.referralCode,
          hasSetupPin: mockUser.hasSetupPin,
          hasBiometrics: mockUser.hasBiometrics,
          withdrawalAddress: mockUser.withdrawalAddress,
          appliedReferralCode: mockUser.appliedReferralCode,
          usdtEarnings: mockUser.usdtEarnings || 0,
          notifications: mockUser.notifications || [],
          isAdmin: mockUser.isAdmin || false
        }));
      }
      
      console.log('Found users:', users.length);
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
      
      // Return mock users as fallback
      return mockUsers.map(mockUser => ({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        coins: mockUser.coins,
        referralCode: mockUser.referralCode,
        hasSetupPin: mockUser.hasSetupPin,
        hasBiometrics: mockUser.hasBiometrics,
        withdrawalAddress: mockUser.withdrawalAddress,
        appliedReferralCode: mockUser.appliedReferralCode,
        usdtEarnings: mockUser.usdtEarnings || 0,
        notifications: mockUser.notifications || [],
        isAdmin: mockUser.isAdmin || false
      }));
    }
  };

  const updateUserUsdtEarnings = async (email: string, amount: number): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can update USDT earnings');
      return;
    }

    try {
      console.log(`Updating USDT earnings for ${email} to ${amount}`);
      
      // Find user by email
      const q = query(usersCollectionRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast.error('User not found');
        throw new Error('User not found');
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const userNotifications = userData.notifications || [];
      
      // Update user in Firestore
      await updateDoc(doc(db, 'users', userDoc.id), {
        usdtEarnings: amount,
        notifications: [
          ...userNotifications,
          {
            id: Date.now().toString(),
            message: `Your USDT earnings have been updated from ${userData.usdtEarnings || 0} to ${amount} by admin.`,
            read: false,
            createdAt: new Date().toISOString()
          }
        ]
      });
      
      console.log('USDT earnings updated successfully');
      toast.success(`${email} के लिए USDT अर्निंग अपडेट की गई`);
    } catch (error) {
      console.error('Error updating USDT earnings:', error);
      toast.error(error instanceof Error ? error.message : 'USDT अर्निंग अपडेट करने में विफल');
    }
  };

  const updateUserCoins = async (email: string, amount: number): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can update user coins');
      return;
    }

    try {
      console.log(`Updating coins for ${email} to ${amount}`);
      
      // Find user by email
      const q = query(usersCollectionRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast.error('User not found');
        throw new Error('User not found');
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const userNotifications = userData.notifications || [];
      
      // Update user in Firestore
      await updateDoc(doc(db, 'users', userDoc.id), {
        coins: amount,
        notifications: [
          ...userNotifications,
          {
            id: Date.now().toString(),
            message: `Your coin balance has been updated from ${userData.coins || 0} to ${amount} by admin.`,
            read: false,
            createdAt: new Date().toISOString()
          }
        ]
      });
      
      console.log('Coins updated successfully');
      toast.success(`${email} के लिए सिक्के अपडेट किए गए`);
    } catch (error) {
      console.error('Error updating coins:', error);
      toast.error(error instanceof Error ? error.message : 'सिक्के अपडेट करने में विफल');
    }
  };

  const deleteUserAccount = async (userId: string): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can delete users');
      return;
    }

    try {
      console.log(`Deleting user with ID: ${userId}`);
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'users', userId));

      // Try to delete from Firebase Auth - using the correct method from Firebase v9+
      try {
        // Find the user in Firebase by UID if possible
        console.log('Attempting to delete user from Firebase Auth');
        
        // For direct deletion of other users, we'd need Admin SDK in a backend
        // This is a client-side operation, so we can only delete the current user
        const currentUser = auth.currentUser;
        
        if (currentUser && currentUser.uid === userId) {
          await deleteFirebaseUser(currentUser);
          console.log('Firebase Auth user deleted successfully');
        } else {
          console.log('Cannot delete Firebase Auth user directly from client SDK');
          // For deleting other users, we would need a server-side function
        }
      } catch (firebaseError) {
        console.error('Firebase Auth deletion error:', firebaseError);
        // Continue even if Firebase Auth deletion fails
      }

      console.log('User deleted successfully');
      toast.success('उपयोगकर्ता सफलतापूर्वक हटा दिया गया');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('उपयोगकर्ता हटाने में विफल');
    }
  };
  
  return {
    getAllUsers,
    updateUserUsdtEarnings,
    updateUserCoins,
    deleteUser: deleteUserAccount
  };
};
