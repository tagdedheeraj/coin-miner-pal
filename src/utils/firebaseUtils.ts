
import { User, WithdrawalRequest, DepositRequest } from '@/types/auth';

// Firebase document mapping utilities
export const mapDbToUser = (data: any): User => {
  return {
    id: data.id || '',
    name: data.name || '',
    email: data.email || '',
    coins: data.coins || 0,
    referralCode: data.referral_code || '',
    hasSetupPin: data.has_setup_pin || false,
    hasBiometrics: data.has_biometrics || false,
    withdrawalAddress: data.withdrawal_address || null,
    appliedReferralCode: data.applied_referral_code || undefined,
    usdtEarnings: data.usdt_earnings || 0,
    notifications: data.notifications || [],
    isAdmin: data.is_admin || false
  };
};

export const mapUserToDb = (user: Partial<User>) => {
  // Convert user properties to firebase format
  return {
    ...user,
    // Firebase specific mappings if needed
  };
};

export const mapDbToWithdrawal = (data: any): WithdrawalRequest => {
  return {
    id: data.id || '',
    userId: data.userId || '',
    userEmail: data.userEmail || '',
    userName: data.userName || '',
    amount: data.amount || 0,
    address: data.address || '',
    status: data.status || 'pending',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || null
  };
};

export const mapWithdrawalToDb = (withdrawal: Partial<WithdrawalRequest>) => {
  // Convert withdrawal properties to firebase format
  return {
    ...withdrawal,
    // Firebase specific mappings if needed
  };
};

export const mapDbToDeposit = (data: any): DepositRequest => {
  return {
    id: data.id || '',
    userId: data.userId || '',
    userEmail: data.userEmail || '',
    userName: data.userName || '',
    planId: data.planId || '',
    planName: data.planName || '',
    amount: data.amount || 0,
    transactionId: data.transactionId || '',
    status: data.status || 'pending',
    timestamp: data.timestamp || new Date().toISOString(),
    reviewedAt: data.reviewedAt || null
  };
};

export const mapDepositToDb = (deposit: Partial<DepositRequest>) => {
  // Convert deposit properties to firebase format
  return {
    ...deposit,
    // Firebase specific mappings if needed
  };
};
