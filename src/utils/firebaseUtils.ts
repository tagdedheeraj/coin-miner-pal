import { User, WithdrawalRequest, DepositRequest, UserPlan } from '@/types/auth';

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
    isAdmin: data.is_admin || false,
    activePlans: (data.active_plans || []).map((plan: any) => ({
      id: plan.id || '',
      planId: plan.planId || '',
      planName: plan.planName || '',
      amount: plan.amount || 0,
      dailyEarnings: plan.dailyEarnings || 0,
      startDate: plan.startDate || '',
      expiryDate: plan.expiryDate || '',
      isActive: plan.isActive || false,
      depositId: plan.depositId || ''
    }))
  };
};

export const mapUserToDb = (user: Partial<User>) => {
  // Convert user properties to firebase format
  const dbUser: Record<string, any> = {};
  
  if ('id' in user && user.id !== undefined) dbUser.id = user.id;
  if ('name' in user && user.name !== undefined) dbUser.name = user.name;
  if ('email' in user && user.email !== undefined) dbUser.email = user.email;
  if ('coins' in user && user.coins !== undefined) dbUser.coins = user.coins;
  if ('referralCode' in user && user.referralCode !== undefined) dbUser.referral_code = user.referralCode;
  if ('hasSetupPin' in user && user.hasSetupPin !== undefined) dbUser.has_setup_pin = user.hasSetupPin;
  if ('hasBiometrics' in user && user.hasBiometrics !== undefined) dbUser.has_biometrics = user.hasBiometrics;
  if ('withdrawalAddress' in user && user.withdrawalAddress !== undefined) dbUser.withdrawal_address = user.withdrawalAddress;
  if ('appliedReferralCode' in user && user.appliedReferralCode !== undefined) dbUser.applied_referral_code = user.appliedReferralCode;
  if ('usdtEarnings' in user && user.usdtEarnings !== undefined) dbUser.usdt_earnings = user.usdtEarnings;
  if ('notifications' in user && user.notifications !== undefined) dbUser.notifications = user.notifications;
  if ('isAdmin' in user && user.isAdmin !== undefined) dbUser.is_admin = user.isAdmin;
  if ('activePlans' in user && user.activePlans !== undefined) dbUser.active_plans = user.activePlans;
  
  return dbUser;
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

export const mapDbToUserPlan = (data: any): UserPlan => {
  return {
    id: data.id || '',
    planId: data.planId || '',
    planName: data.planName || '',
    amount: data.amount || 0,
    dailyEarnings: data.dailyEarnings || 0,
    startDate: data.startDate || '',
    expiryDate: data.expiryDate || '',
    isActive: data.isActive || false,
    depositId: data.depositId || '',
    miningSpeed: data.mining_speed || '1x'  // Added default value
  };
};
