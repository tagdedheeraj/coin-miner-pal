
import { User, WithdrawalRequest, DepositRequest, ArbitragePlan } from '@/types/auth';
import { UserCredential } from 'firebase/auth';

export interface AuthStateType {
  user: User | null;
  isLoading: boolean;
}

export interface AuthBasicContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<UserCredential>;
  signOut: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export interface UserManagementContextType {
  updateUser: (updates: Partial<User>) => void;
  setupPin: (pin: string) => Promise<void>;
  toggleBiometrics: () => Promise<void>;
  setWithdrawalAddress: (address: string) => void;
  deleteUser: (userId: string) => void;
}

export interface ReferralContextType {
  applyReferralCode: (code: string) => Promise<void>;
}

export interface NotificationContextType {
  sendNotificationToAllUsers: (message: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
}

export interface AdminContextType {
  updateUserUsdtEarnings: (email: string, amount: number) => Promise<void>;
  updateUserCoins: (email: string, amount: number) => Promise<void>;
  updateArbitragePlan?: (planId: string, updates: Partial<ArbitragePlan>) => void;
  deleteArbitragePlan?: (planId: string) => void;
  addArbitragePlan?: (plan: Omit<ArbitragePlan, 'id'>) => void;
}

export interface WithdrawalContextType {
  requestWithdrawal: (amount: number) => Promise<void>;
  getWithdrawalRequests: () => Promise<WithdrawalRequest[]>;
  approveWithdrawalRequest: (requestId: string) => Promise<void>;
  rejectWithdrawalRequest: (requestId: string) => Promise<void>;
}

export interface DepositContextType {
  requestPlanPurchase: (depositRequest: Omit<DepositRequest, 'id' | 'status' | 'reviewedAt'>) => Promise<void>;
  getDepositRequests: () => Promise<DepositRequest[]>;
  approveDepositRequest: (requestId: string) => Promise<void>;
  rejectDepositRequest: (requestId: string) => Promise<void>;
}

export interface FullAuthContextType extends 
  AuthBasicContextType,
  UserManagementContextType,
  ReferralContextType,
  NotificationContextType,
  AdminContextType,
  WithdrawalContextType,
  DepositContextType {}
