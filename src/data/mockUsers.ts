
import { MockUser } from '@/types/auth';

// Mock user data for development
export const mockUsers: MockUser[] = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'password123',
    coins: 200, // Sign-up bonus
    referralCode: 'DEMO123',
    hasSetupPin: false,
    hasBiometrics: false,
    withdrawalAddress: null,
    appliedReferralCode: null,
    usdtEarnings: 0,
    notifications: [],
  },
];
