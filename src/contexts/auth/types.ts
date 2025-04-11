
import { User, ArbitragePlan, WithdrawalRequest, DepositRequest } from '@/types/auth';
import { UserCredential } from 'firebase/auth';

export interface AuthStateType {
  user: User | null;
  isLoading: boolean;
}

export interface FullAuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<UserCredential>;
  signOut: () => void;
  updateUser: (updates: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  setupPin: (pin: string) => Promise<void>;
  toggleBiometrics: () => Promise<void>;
  setWithdrawalAddress: (address: string) => void;
  applyReferralCode: (code: string) => Promise<void>;
  deleteUser: (userId: string) => void;
  updateUserUsdtEarnings: (email: string, amount: number) => Promise<void>;
  updateUserCoins: (email: string, amount: number) => Promise<void>;
  updateArbitragePlan?: (planId: string, updates: Partial<ArbitragePlan>) => void;
  deleteArbitragePlan?: (planId: string) => void;
  addArbitragePlan?: (plan: Omit<ArbitragePlan, 'id'>) => void;
  sendNotificationToAllUsers: (message: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  requestWithdrawal: (amount: number) => Promise<void>;
  getWithdrawalRequests: () => Promise<WithdrawalRequest[]>;
  approveWithdrawalRequest: (requestId: string) => Promise<void>;
  rejectWithdrawalRequest: (requestId: string) => Promise<void>;
  requestPlanPurchase: (depositRequest: Omit<DepositRequest, 'id' | 'status' | 'reviewedAt'>) => Promise<void>;
  getDepositRequests: () => Promise<DepositRequest[]>;
  getUserDepositRequests: () => Promise<DepositRequest[]>;
  approveDepositRequest: (requestId: string) => Promise<void>;
  rejectDepositRequest: (requestId: string) => Promise<void>;
}
