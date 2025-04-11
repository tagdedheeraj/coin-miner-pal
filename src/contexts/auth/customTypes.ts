
import { User, ArbitragePlan, WithdrawalRequest, DepositRequest } from '@/types/auth';
import { FullAuthContextType as BaseAuthContextType } from './types';

// Extend the base AuthContextType with our admin functions
export interface FullAuthContextType extends BaseAuthContextType {
  getAllUsers?: () => Promise<User[]>;
  updateUserUsdtEarnings?: (email: string, amount: number) => Promise<void>;
  updateUserCoins?: (email: string, amount: number) => Promise<void>;
}
