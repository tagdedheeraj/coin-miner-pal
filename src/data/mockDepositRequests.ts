
import { DepositRequest } from '@/types/auth';

export const mockDepositRequests: DepositRequest[] = [
  {
    id: "dep-1",
    userId: "user-1",
    userEmail: "john@example.com",
    userName: "John Doe",
    planId: "1",
    planName: "Arbitrage & Starter Plan",
    amount: 20,
    transactionId: "0x1234567890abcdef1234567890abcdef12345678",
    status: "pending",
    timestamp: "2023-10-01T10:00:00Z"
  },
  {
    id: "dep-2",
    userId: "user-2",
    userEmail: "jane@example.com",
    userName: "Jane Smith",
    planId: "2",
    planName: "Pro Miner Plan",
    amount: 50,
    transactionId: "0xabcdef1234567890abcdef1234567890abcdef12",
    status: "approved",
    timestamp: "2023-10-02T11:30:00Z",
    reviewedAt: "2023-10-02T14:45:00Z"
  },
  {
    id: "dep-3",
    userId: "user-3",
    userEmail: "mike@example.com",
    userName: "Mike Wilson",
    planId: "3",
    planName: "Expert Miner Plan",
    amount: 200,
    transactionId: "0x7890abcdef1234567890abcdef1234567890abcd",
    status: "rejected",
    timestamp: "2023-10-03T09:15:00Z",
    reviewedAt: "2023-10-03T12:20:00Z"
  }
];
