
import { User, ArbitragePlan, WithdrawalRequest, DepositRequest } from '@/types/auth';
import { Dispatch, SetStateAction } from 'react';

export interface AuthStateType {
  user: User | null;
  isLoading: boolean;
  setUser?: Dispatch<SetStateAction<User | null>>;
  setIsLoading?: Dispatch<SetStateAction<boolean>>;
}

export interface FullAuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser?: Dispatch<SetStateAction<User | null>>;
  
  // Core Authentication
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<any>;
  resendVerificationEmail: (email: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // User Management
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  setupPin: (pin: string) => Promise<void>;
  setupBiometrics: (enabled: boolean) => Promise<void>;
  
  // Referral Management
  applyReferralCode: (code: string) => Promise<void>;
  
  // Notification Management
  sendNotificationToAllUsers: (message: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  
  // Admin Functions
  updateUserCoins: (userId: string, newAmount: number) => Promise<void>;
  
  // Withdrawal Management
  updateWithdrawalAddress: (address: string) => Promise<void>;
  getWithdrawalRequests: () => Promise<WithdrawalRequest[]>;
  requestWithdrawal: (amount: number) => Promise<void>;
  approveWithdrawal: (withdrawalId: string) => Promise<void>;
  rejectWithdrawal: (withdrawalId: string) => Promise<void>;
  
  // Deposit Management
  getDepositRequests: () => Promise<DepositRequest[]>;
  requestDeposit: (amount: number, transactionId: string) => Promise<void>;
  approveDeposit: (depositId: string) => Promise<void>;
  rejectDeposit: (depositId: string) => Promise<void>;
  
  // Arbitrage Plan Management
  updateArbitragePlan: (planId: string, updates: Partial<ArbitragePlan>) => Promise<void>;
  deleteArbitragePlan: (planId: string) => Promise<void>;
  addArbitragePlan: (plan: Omit<ArbitragePlan, 'id'>) => Promise<void>;
}
