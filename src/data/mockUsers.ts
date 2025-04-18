
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
  {
    id: '2',
    name: 'Admin User',
    email: 'admin@infinium.com',
    password: 'Infiniumcoin@123',
    coins: 1000,
    referralCode: 'ADMIN456',
    hasSetupPin: true,
    hasBiometrics: false,
    withdrawalAddress: null,
    appliedReferralCode: null,
    usdtEarnings: 0,
    notifications: [],
    isAdmin: true, // Admin privileges
  },
];
