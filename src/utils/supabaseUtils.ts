
import { User, WithdrawalRequest, DepositRequest } from '@/types/auth';
import { Json } from '@/integrations/supabase/types';

// Maps our User model to Supabase DB columns
export const mapUserToDb = (user: Partial<User>) => {
  const dbUser: Record<string, any> = {};
  
  if (user.id !== undefined) dbUser.id = user.id;
  if (user.name !== undefined) dbUser.name = user.name;
  if (user.email !== undefined) dbUser.email = user.email;
  if (user.coins !== undefined) dbUser.coins = user.coins;
  if (user.referralCode !== undefined) dbUser.referral_code = user.referralCode;
  if (user.hasSetupPin !== undefined) dbUser.has_setup_pin = user.hasSetupPin;
  if (user.hasBiometrics !== undefined) dbUser.has_biometrics = user.hasBiometrics;
  if (user.withdrawalAddress !== undefined) dbUser.withdrawal_address = user.withdrawalAddress;
  if (user.appliedReferralCode !== undefined) dbUser.applied_referral_code = user.appliedReferralCode;
  if (user.usdtEarnings !== undefined) dbUser.usdt_earnings = user.usdtEarnings;
  if (user.notifications !== undefined) dbUser.notifications = user.notifications;
  if (user.isAdmin !== undefined) dbUser.is_admin = user.isAdmin;
  
  return dbUser;
};

// Maps Supabase DB columns to our User model
export const mapDbToUser = (dbUser: Record<string, any>): User => {
  return {
    id: dbUser.id,
    name: dbUser.name || '',
    email: dbUser.email || '',
    coins: dbUser.coins || 0,
    referralCode: dbUser.referral_code || '',
    hasSetupPin: dbUser.has_setup_pin || false,
    hasBiometrics: dbUser.has_biometrics || false,
    withdrawalAddress: dbUser.withdrawal_address || null,
    appliedReferralCode: dbUser.applied_referral_code || undefined,
    usdtEarnings: dbUser.usdt_earnings || 0,
    notifications: dbUser.notifications || [],
    isAdmin: dbUser.is_admin || false
  };
};

// Maps Supabase withdrawal_requests table to our WithdrawalRequest model
export const mapDbToWithdrawal = (dbWithdrawal: Record<string, any>): WithdrawalRequest => {
  return {
    id: dbWithdrawal.id,
    userId: dbWithdrawal.user_id,
    userEmail: dbWithdrawal.user_email,
    userName: dbWithdrawal.user_name,
    amount: dbWithdrawal.amount,
    address: dbWithdrawal.address,
    status: dbWithdrawal.status,
    createdAt: dbWithdrawal.created_at,
    updatedAt: dbWithdrawal.updated_at
  };
};

// Maps our WithdrawalRequest model to Supabase withdrawal_requests table
export const mapWithdrawalToDb = (withdrawal: Partial<WithdrawalRequest>) => {
  const dbWithdrawal: Record<string, any> = {};
  
  if (withdrawal.id !== undefined) dbWithdrawal.id = withdrawal.id;
  if (withdrawal.userId !== undefined) dbWithdrawal.user_id = withdrawal.userId;
  if (withdrawal.userEmail !== undefined) dbWithdrawal.user_email = withdrawal.userEmail;
  if (withdrawal.userName !== undefined) dbWithdrawal.user_name = withdrawal.userName;
  if (withdrawal.amount !== undefined) dbWithdrawal.amount = withdrawal.amount;
  if (withdrawal.address !== undefined) dbWithdrawal.address = withdrawal.address;
  if (withdrawal.status !== undefined) dbWithdrawal.status = withdrawal.status;
  if (withdrawal.createdAt !== undefined) dbWithdrawal.created_at = withdrawal.createdAt;
  if (withdrawal.updatedAt !== undefined) dbWithdrawal.updated_at = withdrawal.updatedAt;
  
  return dbWithdrawal;
};

// Maps Supabase deposit_requests table to our DepositRequest model
export const mapDbToDeposit = (dbDeposit: Record<string, any>): DepositRequest => {
  return {
    id: dbDeposit.id,
    userId: dbDeposit.user_id,
    userEmail: dbDeposit.user_email,
    userName: dbDeposit.user_name,
    planId: dbDeposit.plan_id,
    planName: dbDeposit.plan_name,
    amount: dbDeposit.amount,
    transactionId: dbDeposit.transaction_id,
    status: dbDeposit.status,
    timestamp: dbDeposit.timestamp,
    reviewedAt: dbDeposit.reviewed_at
  };
};

// Maps our DepositRequest model to Supabase deposit_requests table
export const mapDepositToDb = (deposit: Partial<DepositRequest>) => {
  const dbDeposit: Record<string, any> = {};
  
  if (deposit.id !== undefined) dbDeposit.id = deposit.id;
  if (deposit.userId !== undefined) dbDeposit.user_id = deposit.userId;
  if (deposit.userEmail !== undefined) dbDeposit.user_email = deposit.userEmail;
  if (deposit.userName !== undefined) dbDeposit.user_name = deposit.userName;
  if (deposit.planId !== undefined) dbDeposit.plan_id = deposit.planId;
  if (deposit.planName !== undefined) dbDeposit.plan_name = deposit.planName;
  if (deposit.amount !== undefined) dbDeposit.amount = deposit.amount;
  if (deposit.transactionId !== undefined) dbDeposit.transaction_id = deposit.transactionId;
  if (deposit.status !== undefined) dbDeposit.status = deposit.status;
  if (deposit.timestamp !== undefined) dbDeposit.timestamp = deposit.timestamp;
  if (deposit.reviewedAt !== undefined) dbDeposit.reviewed_at = deposit.reviewedAt;
  
  return dbDeposit;
};
