
import { Dispatch, SetStateAction } from 'react';
import { User, WithdrawalRequest } from '@/types/auth';
import { mockUsers } from '@/data/mockUsers';
import { mockWithdrawalRequests } from '@/data/mockWithdrawalRequests';
import { toast } from 'sonner';
import { auth, db } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
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
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

// Admin credentials
const ADMIN_EMAIL = 'admin@infinium.com';
const ADMIN_PASSWORD = 'Infinium@123';

export const authFunctions = (
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
        
        setUser(adminUser);
        toast.success('Signed in as Admin');
        return;
      }
      
      // Regular user login with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Fetch user data from Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as Omit<User, 'id'>;
        setUser({
          id: firebaseUser.uid,
          ...userData
        });
        toast.success('Signed in successfully');
      } else {
        // User exists in Firebase Auth but not in Firestore
        throw new Error('User data not found');
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to sign in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Create new user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Generate referral code
      const referralCode = 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Create user document in Firestore
      const newUser: Omit<User, 'id'> = {
        name,
        email,
        coins: 200, // Sign-up bonus
        referralCode,
        hasSetupPin: false,
        hasBiometrics: false,
        withdrawalAddress: null,
        appliedReferralCode: null,
        usdtEarnings: 0,
        notifications: []
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      
      setUser({
        id: firebaseUser.uid,
        ...newUser
      });
      
      toast.success('Account created successfully! You received 200 coins as a signup bonus.');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to sign up');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Only sign out from Firebase if not admin
      if (user && !user.isAdmin) {
        await firebaseSignOut(auth);
      }
      setUser(null);
      localStorage.removeItem('user');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to sign out');
    }
  };

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

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error('Not authenticated');
    if (user.isAdmin) throw new Error('Admin password cannot be changed');
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Authentication error');
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      
      // Change password
      await updatePassword(currentUser, newPassword);
      
      toast.success('Password changed successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
      throw error;
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

  const applyReferralCode = async (code: string): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    if (user.isAdmin) throw new Error('Admin cannot apply referral code');
    
    try {
      // Check if user has already applied a referral code
      if (user.appliedReferralCode) {
        throw new Error('You have already applied a referral code');
      }
      
      // Validate referral code
      if (code === user.referralCode) {
        throw new Error('You cannot use your own referral code');
      }
      
      // Find the user with the given referral code
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referralCode', '==', code));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Invalid referral code');
      }
      
      // Get the first user doc (there should only be one)
      const referrerDoc = querySnapshot.docs[0];
      const referrerId = referrerDoc.id;
      const referrerData = referrerDoc.data() as User;
      
      // Update the referrer's coins and add notification
      const referrerRef = doc(db, 'users', referrerId);
      const referrerNotifications = referrerData.notifications || [];
      
      await updateDoc(referrerRef, {
        coins: (referrerData.coins || 0) + 250,
        notifications: [
          ...referrerNotifications,
          {
            id: Date.now().toString(),
            message: `${user.name} used your referral code! You received 250 bonus coins.`,
            read: false,
            createdAt: new Date().toISOString()
          }
        ]
      });
      
      // Update current user with applied referral code
      await updateUser({ appliedReferralCode: code });
      
      toast.success('Referral code applied successfully!');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to apply referral code');
      throw error;
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

  const updateUserUsdtEarnings = async (email: string, amount: number): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can update USDT earnings');
      return;
    }

    try {
      // Find the user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('User not found');
      }
      
      // Get the first user doc (there should only be one)
      const userDoc = querySnapshot.docs[0];
      const userId = userDoc.id;
      const userData = userDoc.data() as User;
      
      // Update USDT earnings and add notification
      const userRef = doc(db, 'users', userId);
      const userNotifications = userData.notifications || [];
      
      await updateDoc(userRef, {
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
      
      toast.success(`USDT earnings updated for ${email}`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to update USDT earnings');
      throw error;
    }
  };

  const updateUserCoins = async (email: string, amount: number): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can update user coins');
      return;
    }

    try {
      // Find the user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('User not found');
      }
      
      // Get the first user doc (there should only be one)
      const userDoc = querySnapshot.docs[0];
      const userId = userDoc.id;
      const userData = userDoc.data() as User;
      
      // Update coins and add notification
      const userRef = doc(db, 'users', userId);
      const userNotifications = userData.notifications || [];
      
      await updateDoc(userRef, {
        coins: amount,
        notifications: [
          ...userNotifications,
          {
            id: Date.now().toString(),
            message: `Your coin balance has been updated from ${userData.coins} to ${amount} by admin.`,
            read: false,
            createdAt: new Date().toISOString()
          }
        ]
      });
      
      toast.success(`Coins updated for ${email}`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to update coins');
      throw error;
    }
  };

  const sendNotificationToAllUsers = async (message: string) => {
    if (!user?.isAdmin) {
      toast.error('Only admins can send notifications');
      return;
    }
    
    try {
      // Create notification object
      const notification = {
        id: Date.now().toString(),
        message,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      // Get all users from Firestore
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      // Create batch to update all users efficiently
      const batch = [];
      
      // Add notification to all users
      querySnapshot.forEach((userDoc) => {
        const userId = userDoc.id;
        const userData = userDoc.data();
        const userNotifications = userData.notifications || [];
        
        batch.push(updateDoc(doc(db, 'users', userId), {
          notifications: [...userNotifications, notification]
        }));
      });
      
      // Execute all updates
      await Promise.all(batch);
      
      // Update current admin user's state if they have notifications
      if (user && user.isAdmin) {
        const currentUserNotifications = [...(user.notifications || []), notification];
        setUser({
          ...user,
          notifications: currentUserNotifications
        });
      }
      
      toast.success('Notification sent to all users');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to send notification');
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      // Update the notification in the current user's state
      const updatedNotifications = user.notifications?.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      );
      
      // Update the user state
      setUser({
        ...user,
        notifications: updatedNotifications
      });
      
      // Skip Firestore update for admin users
      if (user.isAdmin) return;
      
      // Update in Firestore
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        notifications: updatedNotifications
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to mark notification as read');
    }
  };

  const requestWithdrawal = async (amount: number): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    if (user.isAdmin) throw new Error('Admin cannot request withdrawals');
    
    if (!user.withdrawalAddress) {
      throw new Error('Please set a withdrawal address first');
    }
    
    try {
      // Calculate available USDT balance
      const availableBalance = user.usdtEarnings || 0;
      
      if (amount > availableBalance) {
        throw new Error('Insufficient balance');
      }
      
      if (amount < 50) {
        throw new Error('Minimum withdrawal amount is $50');
      }
      
      // Create withdrawal request in Firestore
      const withdrawalRequest: Omit<WithdrawalRequest, 'id'> = {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        amount,
        address: user.withdrawalAddress,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      const withdrawalRef = await addDoc(collection(db, 'withdrawalRequests'), withdrawalRequest);
      
      // Create notification for user
      const notification = {
        id: Date.now().toString(),
        message: `Your withdrawal request for $${amount.toFixed(2)} USDT has been submitted and is awaiting approval.`,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      const updatedNotifications = [...(user.notifications || []), notification];
      await updateUser({ notifications: updatedNotifications });
      
      toast.success('Withdrawal request submitted successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to request withdrawal');
      throw error;
    }
  };
  
  const getWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
    if (!user?.isAdmin) {
      return [];
    }
    
    try {
      const withdrawalRequestsRef = collection(db, 'withdrawalRequests');
      const querySnapshot = await getDocs(withdrawalRequestsRef);
      
      const withdrawalRequests: WithdrawalRequest[] = [];
      
      querySnapshot.forEach((doc) => {
        withdrawalRequests.push({
          id: doc.id,
          ...doc.data()
        } as WithdrawalRequest);
      });
      
      return withdrawalRequests;
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch withdrawal requests');
      return [];
    }
  };
  
  const approveWithdrawalRequest = async (requestId: string): void => {
    if (!user?.isAdmin) {
      toast.error('Only admins can approve withdrawal requests');
      return;
    }
    
    try {
      // Get the withdrawal request
      const requestRef = doc(db, 'withdrawalRequests', requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) {
        toast.error('Withdrawal request not found');
        return;
      }
      
      const request = requestDoc.data() as WithdrawalRequest;
      
      if (request.status !== 'pending') {
        toast.error('This request has already been processed');
        return;
      }
      
      // Update request status
      await updateDoc(requestRef, {
        status: 'approved',
        updatedAt: new Date().toISOString()
      });
      
      // Find the user and update their USDT earnings
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', request.userEmail));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userId = userDoc.id;
        const userData = userDoc.data() as User;
        
        const userRef = doc(db, 'users', userId);
        const currentEarnings = userData.usdtEarnings || 0;
        const userNotifications = userData.notifications || [];
        
        await updateDoc(userRef, {
          usdtEarnings: currentEarnings - request.amount,
          notifications: [
            ...userNotifications,
            {
              id: Date.now().toString(),
              message: `Your withdrawal request for $${request.amount.toFixed(2)} USDT has been approved and processed.`,
              read: false,
              createdAt: new Date().toISOString()
            }
          ]
        });
      }
      
      toast.success('Withdrawal request approved successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to approve withdrawal request');
    }
  };
  
  const rejectWithdrawalRequest = async (requestId: string): void => {
    if (!user?.isAdmin) {
      toast.error('Only admins can reject withdrawal requests');
      return;
    }
    
    try {
      // Get the withdrawal request
      const requestRef = doc(db, 'withdrawalRequests', requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) {
        toast.error('Withdrawal request not found');
        return;
      }
      
      const request = requestDoc.data() as WithdrawalRequest;
      
      if (request.status !== 'pending') {
        toast.error('This request has already been processed');
        return;
      }
      
      // Update request status
      await updateDoc(requestRef, {
        status: 'rejected',
        updatedAt: new Date().toISOString()
      });
      
      // Find the user and send notification
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', request.userEmail));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userId = userDoc.id;
        const userData = userDoc.data() as User;
        
        const userRef = doc(db, 'users', userId);
        const userNotifications = userData.notifications || [];
        
        await updateDoc(userRef, {
          notifications: [
            ...userNotifications,
            {
              id: Date.now().toString(),
              message: `Your withdrawal request for $${request.amount.toFixed(2)} USDT has been rejected. Please contact support for more information.`,
              read: false,
              createdAt: new Date().toISOString()
            }
          ]
        });
      }
      
      toast.success('Withdrawal request rejected successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to reject withdrawal request');
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    updateUser,
    changePassword,
    setupPin,
    toggleBiometrics,
    setWithdrawalAddress,
    applyReferralCode,
    deleteUser,
    updateUserUsdtEarnings,
    updateUserCoins,
    sendNotificationToAllUsers,
    markNotificationAsRead,
    requestWithdrawal,
    getWithdrawalRequests,
    approveWithdrawalRequest,
    rejectWithdrawalRequest,
  };
};
