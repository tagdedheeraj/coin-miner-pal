
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, ArbitragePlan } from '@/types/auth';
import { mockArbitragePlans } from '@/data/mockArbitragePlans';
import { toast } from 'sonner';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/integrations/firebase/client';

// Import services
import { authServiceFunctions } from '@/services/auth/authService';
import { userProfileServiceFunctions } from '@/services/auth/userProfileService';
import { arbitragePlanServiceFunctions } from '@/services/auth/arbitragePlanService';
import { notificationServiceFunctions } from '@/services/auth/notificationService';
import { referralServiceFunctions } from '@/services/auth/referralService';
import { depositManagementServiceFunctions } from '@/services/auth/depositManagementService';
import { withdrawalManagementServiceFunctions } from '@/services/auth/withdrawalManagementService';

export const AuthContext = createContext<any>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log('AuthProvider initializing');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [arbitragePlans, setArbitragePlans] = useState<ArbitragePlan[]>(mockArbitragePlans);
  
  try {
    // Initialize services
    const authService = authServiceFunctions(setUser, setIsLoading);
    const userProfileService = userProfileServiceFunctions(user, setUser);
    const arbitragePlanService = arbitragePlanServiceFunctions(arbitragePlans, setArbitragePlans);
    const notificationService = notificationServiceFunctions(user, setUser);
    const referralService = referralServiceFunctions(user, setUser);
    const depositService = depositManagementServiceFunctions();
    const withdrawalService = withdrawalManagementServiceFunctions(user, setUser);
    
    useEffect(() => {
      console.log('AuthProvider useEffect running - setting up auth listener');
      let unsubscribe: (() => void) | undefined;
      
      try {
        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          console.log('Firebase auth state changed:', firebaseUser ? 'User logged in' : 'No user');
          if (firebaseUser) {
            const userObj = authService.convertFirebaseUserToAppUser(firebaseUser);
            setUser(userObj);
          } else {
            setUser(null);
          }
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Error in auth state listener:', error);
        setIsLoading(false);
      }
      
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }, []);

    // Combine all services into a single context value
    const contextValue = {
      user,
      isAuthenticated: !!user,
      isLoading,
      setUser,
      
      // Auth Service
      signIn: authService.signIn,
      signInWithGoogle: authService.signInWithGoogle,
      signOut: authService.signOut,
      signUp: authService.signUp,
      resendVerificationEmail: authService.resendVerificationEmail,
      resetPassword: authService.resetPassword,
      changePassword: authService.changePassword,
      
      // User Profile Service
      updateUser: userProfileService.updateUser,
      updateUserProfile: userProfileService.updateUser,
      setupPin: userProfileService.setupPin,
      setupBiometrics: userProfileService.setupBiometrics,
      toggleBiometrics: userProfileService.toggleBiometrics,
      updateWithdrawalAddress: userProfileService.updateWithdrawalAddress,
      setWithdrawalAddress: userProfileService.setWithdrawalAddress,
      getAllUsers: userProfileService.getAllUsers,
      updateUserUsdtEarnings: userProfileService.updateUserUsdtEarnings,
      updateUserCoins: userProfileService.updateUserCoins,
      deleteUser: userProfileService.deleteUser,
      
      // Arbitrage Plan Service
      updateArbitragePlan: arbitragePlanService.updateArbitragePlan,
      deleteArbitragePlan: arbitragePlanService.deleteArbitragePlan,
      addArbitragePlan: arbitragePlanService.addArbitragePlan,
      
      // Notification Service
      sendNotificationToAllUsers: notificationService.sendNotificationToAllUsers,
      markNotificationAsRead: notificationService.markNotificationAsRead,
      
      // Referral Service
      applyReferralCode: referralService.applyReferralCode,
      
      // Deposit Service
      getDepositRequests: depositService.getDepositRequests,
      getUserDepositRequests: () => depositService.getUserDepositRequests(user?.id),
      requestPlanPurchase: depositService.requestPlanPurchase,
      approveDepositRequest: depositService.approveDepositRequest,
      approveDeposit: depositService.approveDepositRequest,
      rejectDepositRequest: depositService.rejectDepositRequest,
      rejectDeposit: depositService.rejectDepositRequest,
      
      // Withdrawal Service
      getWithdrawalRequests: withdrawalService.getWithdrawalRequests,
      requestWithdrawal: withdrawalService.requestWithdrawal,
      approveWithdrawalRequest: withdrawalService.approveWithdrawalRequest,
      approveWithdrawal: withdrawalService.approveWithdrawalRequest,
      rejectWithdrawalRequest: withdrawalService.rejectWithdrawalRequest,
      rejectWithdrawal: withdrawalService.rejectWithdrawalRequest,

      // For backwards compatibility
      requestDeposit: async (amount: number, transactionId: string) => {
        console.log('Deprecated requestDeposit called with:', amount, transactionId);
        toast.success('Deposit request submitted for review.');
      }
    };

    console.log('AuthProvider rendering children');
    return (
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
    );
  } catch (error) {
    console.error('Error in AuthProvider:', error);
    return <div>Error initializing authentication. Please check console.</div>;
  }
};

export default AuthProvider;
