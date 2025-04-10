
export interface User {
  id: string;
  name: string;
  email: string;
  coins: number;
  referralCode: string;
  hasSetupPin: boolean;
  hasBiometrics: boolean;
  withdrawalAddress: string | null;
  appliedReferralCode?: string;
  usdtEarnings?: number;
  notifications?: Notification[];
  isAdmin?: boolean;
  password?: string; // Only used during auth, not stored in state
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}

export interface DepositRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  planId: string;
  planName: string;
  amount: number;
  transactionId: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  reviewedAt?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<any>;
  signOut: () => void;
  updateUser: (updates: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
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
  approveDepositRequest: (requestId: string) => Promise<void>;
  rejectDepositRequest: (requestId: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export interface MockUser extends User {
  password: string;
}

export interface ArbitragePlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  dailyEarnings: number;
  totalEarnings: number;
  miningSpeed: string;
  withdrawal: string;
  color: string;
  limited: boolean;
  limitedTo?: number;
}
