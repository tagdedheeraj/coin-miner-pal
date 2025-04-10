
import { User, WithdrawalRequest, DepositRequest } from '@/types/auth';
import { Json } from '@/integrations/supabase/types';

// Convert camelCase JavaScript object keys to snake_case for Supabase
export const toSnakeCase = (obj: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    result[snakeKey] = obj[key];
  });
  
  return result;
};

// Convert snake_case database object keys to camelCase for JavaScript
export const toCamelCase = (obj: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  });
  
  return result;
};

// Type for insertion into users table
export type UserDbInsert = {
  id: string;
  name: string;
  email: string;
  coins?: number;
  referral_code: string;
  has_setup_pin?: boolean;
  has_biometrics?: boolean;
  withdrawal_address?: string | null;
  applied_referral_code?: string | null;
  usdt_earnings?: number | null;
  notifications?: Json | null;
  is_admin?: boolean | null;
}

// Type for insertion into withdrawal_requests table
export type WithdrawalDbInsert = {
  id?: string;
  user_id: string;
  user_email: string;
  user_name: string;
  amount: number;
  address: string;
  status?: string;
  created_at?: string | null;
  updated_at?: string | null;
}

// Type for insertion into deposit_requests table
export type DepositDbInsert = {
  id?: string;
  user_id: string;
  user_email: string;
  user_name: string;
  plan_id: string;
  plan_name: string;
  amount: number;
  transaction_id: string;
  status?: string;
  timestamp?: string | null;
  reviewed_at?: string | null;
}

// Map User object to database format
export const mapUserToDb = (user: Partial<User>): UserDbInsert | Partial<UserDbInsert> => {
  // Check if we're creating a new user with required fields or updating an existing one
  const isCreatingNewUser = 'id' in user && 'name' in user && 'email' in user && 'referralCode' in user;
  
  const mapped: Partial<UserDbInsert> = {};
  
  if ('id' in user) mapped.id = user.id!;
  if ('name' in user) mapped.name = user.name!;
  if ('email' in user) mapped.email = user.email!;
  if ('coins' in user) mapped.coins = user.coins;
  if ('referralCode' in user) mapped.referral_code = user.referralCode!;
  if ('hasSetupPin' in user) mapped.has_setup_pin = user.hasSetupPin;
  if ('hasBiometrics' in user) mapped.has_biometrics = user.hasBiometrics;
  if ('withdrawalAddress' in user) mapped.withdrawal_address = user.withdrawalAddress;
  if ('appliedReferralCode' in user) mapped.applied_referral_code = user.appliedReferralCode;
  if ('usdtEarnings' in user) mapped.usdt_earnings = user.usdtEarnings;
  if ('notifications' in user) mapped.notifications = user.notifications;
  if ('isAdmin' in user) mapped.is_admin = user.isAdmin;
  
  // If we're creating a new user, we need to assert it's a complete UserDbInsert
  if (isCreatingNewUser) {
    return mapped as UserDbInsert;
  }
  
  return mapped;
};

// Map database user to User object
export const mapDbToUser = (data: Record<string, any>): User => {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    coins: data.coins,
    referralCode: data.referral_code,
    hasSetupPin: data.has_setup_pin,
    hasBiometrics: data.has_biometrics,
    withdrawalAddress: data.withdrawal_address,
    appliedReferralCode: data.applied_referral_code,
    usdtEarnings: data.usdt_earnings,
    notifications: data.notifications,
    isAdmin: data.is_admin
  };
};

// Map WithdrawalRequest object to database format
export const mapWithdrawalToDb = (withdrawal: Partial<WithdrawalRequest>): WithdrawalDbInsert | Partial<WithdrawalDbInsert> => {
  // Check if we're creating a new withdrawal with required fields or updating an existing one
  const isCreatingNew = 'userId' in withdrawal && 'userEmail' in withdrawal && 
                       'userName' in withdrawal && 'amount' in withdrawal && 
                       'address' in withdrawal;
  
  const mapped: Partial<WithdrawalDbInsert> = {};
  
  if ('id' in withdrawal) mapped.id = withdrawal.id;
  if ('userId' in withdrawal) mapped.user_id = withdrawal.userId!;
  if ('userEmail' in withdrawal) mapped.user_email = withdrawal.userEmail!;
  if ('userName' in withdrawal) mapped.user_name = withdrawal.userName!;
  if ('amount' in withdrawal) mapped.amount = withdrawal.amount!;
  if ('address' in withdrawal) mapped.address = withdrawal.address!;
  if ('status' in withdrawal) mapped.status = withdrawal.status;
  if ('createdAt' in withdrawal) mapped.created_at = withdrawal.createdAt;
  if ('updatedAt' in withdrawal) mapped.updated_at = withdrawal.updatedAt;
  
  // If we're creating a new withdrawal, we need to assert it's a complete WithdrawalDbInsert
  if (isCreatingNew) {
    return mapped as WithdrawalDbInsert;
  }
  
  return mapped;
};

// Map database withdrawal to WithdrawalRequest object
export const mapDbToWithdrawal = (data: Record<string, any>): WithdrawalRequest => {
  return {
    id: data.id,
    userId: data.user_id,
    userEmail: data.user_email,
    userName: data.user_name,
    amount: data.amount,
    address: data.address,
    status: data.status as 'pending' | 'approved' | 'rejected',
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

// Map DepositRequest object to database format
export const mapDepositToDb = (deposit: Partial<DepositRequest>): DepositDbInsert | Partial<DepositDbInsert> => {
  // Check if we're creating a new deposit with required fields or updating an existing one
  const isCreatingNew = 'userId' in deposit && 'userEmail' in deposit && 
                       'userName' in deposit && 'planId' in deposit && 
                       'planName' in deposit && 'amount' in deposit && 
                       'transactionId' in deposit;
  
  const mapped: Partial<DepositDbInsert> = {};
  
  if ('id' in deposit) mapped.id = deposit.id;
  if ('userId' in deposit) mapped.user_id = deposit.userId!;
  if ('userEmail' in deposit) mapped.user_email = deposit.userEmail!;
  if ('userName' in deposit) mapped.user_name = deposit.userName!;
  if ('planId' in deposit) mapped.plan_id = deposit.planId!;
  if ('planName' in deposit) mapped.plan_name = deposit.planName!;
  if ('amount' in deposit) mapped.amount = deposit.amount!;
  if ('transactionId' in deposit) mapped.transaction_id = deposit.transactionId!;
  if ('status' in deposit) mapped.status = deposit.status;
  if ('timestamp' in deposit) mapped.timestamp = deposit.timestamp;
  if ('reviewedAt' in deposit) mapped.reviewed_at = deposit.reviewedAt;
  
  // If we're creating a new deposit, we need to assert it's a complete DepositDbInsert
  if (isCreatingNew) {
    return mapped as DepositDbInsert;
  }
  
  return mapped;
};

// Map database deposit to DepositRequest object
export const mapDbToDeposit = (data: Record<string, any>): DepositRequest => {
  return {
    id: data.id,
    userId: data.user_id,
    userEmail: data.user_email,
    userName: data.user_name,
    planId: data.plan_id,
    planName: data.plan_name,
    amount: data.amount,
    transactionId: data.transaction_id,
    status: data.status as 'pending' | 'approved' | 'rejected',
    timestamp: data.timestamp,
    reviewedAt: data.reviewed_at
  };
};
