
import React, { createContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AuthStateProvider } from './AuthStateContext';
import { useAuthData } from './useAuthData';
import { User, ArbitragePlan, WithdrawalRequest, DepositRequest } from '@/types/auth';
import { mockArbitragePlans } from '@/data/mockArbitragePlans';
import { mockDepositRequests } from '@/data/mockDepositRequests';
import { mockUsers } from '@/data/mockUsers';
import { useToast } from "@/hooks/use-toast";
import { FullAuthContextType } from './types';
import { authFunctions } from '@/services/authService';

export const AuthContext = createContext<FullAuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user, setUser, isLoading, setIsLoading } = useAuthData();
  const [arbitragePlans, setArbitragePlans] = useState<ArbitragePlan[]>(mockArbitragePlans);
  const { toast } = useToast();

  // Get all auth functions from the service
  const auth = authFunctions(user, setUser, setIsLoading);

  // Custom implementations for functions that need the local state
  const updateArbitragePlan = async (planId: string, updates: Partial<ArbitragePlan>): Promise<void> => {
    setArbitragePlans(prevPlans =>
      prevPlans.map(plan =>
        plan.id === planId ? { ...plan, ...updates } : plan
      )
    );
  };
  
  const deleteArbitragePlan = async (planId: string): Promise<void> => {
    setArbitragePlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
  };
  
  const addArbitragePlan = async (plan: Omit<ArbitragePlan, 'id'>): Promise<void> => {
    const newPlan: ArbitragePlan = {
      id: uuidv4(),
      ...plan,
    };
    setArbitragePlans(prevPlans => [...prevPlans, newPlan]);
  };

  // Combine auth service functions with local state functions
  // We need to ensure all required methods from FullAuthContextType are implemented
  const contextValue: FullAuthContextType = {
    // Core auth state
    user,
    isAuthenticated: !!user,
    isLoading,
    setUser,
    
    // Core Authentication
    signIn: auth.signIn,
    signInWithGoogle: auth.signInWithGoogle,
    signOut: auth.signOut,
    signUp: auth.signUp,
    resendVerificationEmail: async (email: string) => {
      console.log("Resending verification email to:", email);
      toast({
        title: "Verification Email Sent",
        description: "Please check your inbox for the verification email."
      });
    },
    resetPassword: async (email: string) => {
      console.log("Resetting password for:", email);
      toast({
        title: "Password Reset",
        description: "Password reset instructions have been sent to your email."
      });
    },
    
    // User Management
    updateUser: auth.updateUser,
    updateUserProfile: auth.updateUser, // Alias for updateUser
    setupPin: auth.setupPin,
    setupBiometrics: async (enabled: boolean) => {
      if (user) {
        await auth.updateUser({ hasBiometrics: enabled });
      }
    },
    toggleBiometrics: auth.toggleBiometrics,
    changePassword: auth.changePassword,
    
    // Referral Management
    applyReferralCode: auth.applyReferralCode,
    
    // Notification Management
    sendNotificationToAllUsers: auth.sendNotificationToAllUsers,
    markNotificationAsRead: auth.markNotificationAsRead,
    
    // Admin Functions
    updateUserUsdtEarnings: auth.updateUserUsdtEarnings,
    updateUserCoins: auth.updateUserCoins,
    deleteUser: auth.deleteUser,
    
    // Withdrawal Management
    updateWithdrawalAddress: auth.setWithdrawalAddress, // Alias for setWithdrawalAddress
    setWithdrawalAddress: auth.setWithdrawalAddress,
    getWithdrawalRequests: auth.getWithdrawalRequests,
    requestWithdrawal: auth.requestWithdrawal,
    approveWithdrawalRequest: auth.approveWithdrawalRequest,
    approveWithdrawal: auth.approveWithdrawalRequest, // Alias for approveWithdrawalRequest
    rejectWithdrawalRequest: auth.rejectWithdrawalRequest,
    rejectWithdrawal: auth.rejectWithdrawalRequest, // Alias for rejectWithdrawalRequest
    
    // Deposit Management
    getDepositRequests: auth.getDepositRequests,
    getUserDepositRequests: auth.getUserDepositRequests,
    requestDeposit: async (amount: number, transactionId: string) => {
      console.log("Requesting deposit:", amount, transactionId);
      toast({
        title: "Deposit Requested",
        description: "Your deposit request has been submitted for review."
      });
    },
    requestPlanPurchase: auth.requestPlanPurchase,
    approveDepositRequest: auth.approveDepositRequest,
    approveDeposit: auth.approveDepositRequest, // Alias for approveDepositRequest
    rejectDepositRequest: auth.rejectDepositRequest,
    rejectDeposit: auth.rejectDepositRequest, // Alias for rejectDepositRequest
    
    // Arbitrage Plan Management
    updateArbitragePlan,
    deleteArbitragePlan,
    addArbitragePlan
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Wrap component with both context providers
export const CombinedAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return (
    <AuthStateProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </AuthStateProvider>
  );
};
