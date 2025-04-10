
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
  updateUser: (updates: Partial<User>) => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  setupPin: (pin: string) => Promise<void>;
  setupBiometrics: (enabled: boolean) => Promise<void>;
  toggleBiometrics: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  
  // Referral Management
  applyReferralCode: (code: string) => Promise<void>;
  
  // Notification Management
  sendNotificationToAllUsers: (message: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  
  // Admin Functions
  updateUserUsdtEarnings: (email: string, amount: number) => Promise<void>;
  updateUserCoins: (userId: string, newAmount: number) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  
  // Withdrawal Management
  updateWithdrawalAddress: (address: string) => Promise<void>;
  setWithdrawalAddress: (address: string) => Promise<void>;
  getWithdrawalRequests: () => Promise<WithdrawalRequest[]>;
  requestWithdrawal: (amount: number) => Promise<void>;
  approveWithdrawalRequest: (withdrawalId: string) => Promise<void>;
  approveWithdrawal: (withdrawalId: string) => Promise<void>;
  rejectWithdrawalRequest: (withdrawalId: string) => Promise<void>;
  rejectWithdrawal: (withdrawalId: string) => Promise<void>;
  
  // Deposit Management
  getDepositRequests: () => Promise<DepositRequest[]>;
  getUserDepositRequests: () => Promise<DepositRequest[]>;
  requestDeposit: (amount: number, transactionId: string) => Promise<void>;
  requestPlanPurchase: (depositRequest: Omit<DepositRequest, 'id' | 'status' | 'reviewedAt'>) => Promise<void>;
  approveDepositRequest: (depositId: string) => Promise<void>;
  approveDeposit: (depositId: string) => Promise<void>;
  rejectDepositRequest: (depositId: string) => Promise<void>;
  rejectDeposit: (depositId: string) => Promise<void>;
  
  // Arbitrage Plan Management
  updateArbitragePlan: (planId: string, updates: Partial<ArbitragePlan>) => Promise<void>;
  deleteArbitragePlan: (planId: string) => Promise<void>;
  addArbitragePlan: (plan: Omit<ArbitragePlan, 'id'>) => Promise<void>;
}
