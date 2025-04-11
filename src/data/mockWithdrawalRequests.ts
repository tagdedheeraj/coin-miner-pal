
import { WithdrawalRequest } from '@/types/auth';

// Mock withdrawal requests data for development
export const mockWithdrawalRequests: WithdrawalRequest[] = [
  {
    id: 'wr-1',
    userId: 'user1',
    userEmail: 'user1@example.com',
    userName: 'Test User 1',
    amount: 100,
    address: '0x1234567890abcdef1234567890abcdef12345678',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'wr-2',
    userId: 'user2',
    userEmail: 'user2@example.com',
    userName: 'Test User 2',
    amount: 200,
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date().toISOString()
  },
  {
    id: 'wr-3',
    userId: 'user3',
    userEmail: 'user3@example.com',
    userName: 'Test User 3',
    amount: 75,
    address: '0x7890abcdef1234567890abcdef1234567890abcd',
    status: 'rejected',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  }
];
