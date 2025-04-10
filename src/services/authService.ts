
import { Dispatch, SetStateAction } from 'react';
import { User, WithdrawalRequest, DepositRequest } from '@/types/auth';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

// Import all service modules
import { coreAuthFunctions } from './auth/core';
import { userServiceFunctions } from './auth/userService';
import { referralServiceFunctions } from './auth/referralService';
import { notificationServiceFunctions } from './auth/notificationService';
import { adminServiceFunctions } from './auth/adminService';
import { withdrawalServiceFunctions } from './auth/withdrawalService';
import { depositServiceFunctions } from './auth/depositService';

export const authFunctions = (
  user: User | null, 
  setUser: Dispatch<SetStateAction<User | null>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  // Initialize all service modules
  const coreAuth = coreAuthFunctions(user, setUser, setIsLoading);
  const userService = userServiceFunctions(user, setUser);
  const referralService = referralServiceFunctions(user, setUser);
  const notificationService = notificationServiceFunctions(user, setUser);
  const adminService = adminServiceFunctions(user);
  const withdrawalService = withdrawalServiceFunctions(user);
  const depositService = depositServiceFunctions(user);
  
  // Override signIn method to handle Supabase data fetching
  const signIn = async (email: string, password: string) => {
    try {
      await coreAuth.signIn(email, password);
      
      // If we get here, we need to fetch the user data from Supabase
      // This will happen when auth.currentUser exists but we haven't loaded the Supabase data yet
      // We'll complete this in the auth state change listener in the application
    } catch (error) {
      throw error;
    }
  };
  
  // Override signUp method to handle Supabase data creation
  const signUp = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // First create the Supabase Auth user
      const userCredential = await coreAuth.signUp(name, email, password);
      
      // Get the newly created Supabase user ID
      const supabaseUser = userCredential.user;
      
      if (!supabaseUser) {
        throw new Error('Failed to create user');
      }
      
      // Generate referral code
      const referralCode = 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Create user document in Supabase
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
      
      // Add user to Supabase
      const { error } = await supabase
        .from('users')
        .insert([{ id: supabaseUser.id, ...newUser }]);
      
      if (error) throw error;
      
      // Create user with ID
      const userWithId = {
        id: supabaseUser.id,
        ...newUser
      };
      
      // Save user in local state
      setUser(userWithId);
      
      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(userWithId));
      
      toast.success('Account created successfully! You received 200 coins as a signup bonus.');
      return userCredential;
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to sign up');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    // Core auth functions
    signIn,
    signUp,
    signOut: coreAuth.signOut,
    changePassword: coreAuth.changePassword,
    
    // User management functions
    updateUser: userService.updateUser,
    setupPin: userService.setupPin,
    toggleBiometrics: userService.toggleBiometrics,
    setWithdrawalAddress: userService.setWithdrawalAddress,
    deleteUser: userService.deleteUser,
    
    // Referral functions
    applyReferralCode: referralService.applyReferralCode,
    
    // Notification functions
    sendNotificationToAllUsers: notificationService.sendNotificationToAllUsers,
    markNotificationAsRead: notificationService.markNotificationAsRead,
    
    // Admin functions
    updateUserUsdtEarnings: adminService.updateUserUsdtEarnings,
    updateUserCoins: adminService.updateUserCoins,
    
    // Withdrawal functions
    requestWithdrawal: withdrawalService.requestWithdrawal,
    getWithdrawalRequests: withdrawalService.getWithdrawalRequests,
    approveWithdrawalRequest: withdrawalService.approveWithdrawalRequest,
    rejectWithdrawalRequest: withdrawalService.rejectWithdrawalRequest,
    
    // Deposit functions
    requestPlanPurchase: depositService.requestPlanPurchase,
    getDepositRequests: depositService.getDepositRequests,
    approveDepositRequest: depositService.approveDepositRequest,
    rejectDepositRequest: depositService.rejectDepositRequest
  };
};
