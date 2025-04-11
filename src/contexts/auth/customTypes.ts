
import { User, ArbitragePlan } from '@/types/auth';
import { FullAuthContextType as BaseAuthContextType } from './types';

// Extend the base AuthContextType with our admin functions
export interface FullAuthContextType extends Omit<BaseAuthContextType, 'updateUserUsdtEarnings' | 'updateUserCoins'> {
  getAllUsers?: () => Promise<User[]>;
  updateUserUsdtEarnings: (email: string, amount: number) => Promise<void>;
  updateUserCoins: (email: string, amount: number) => Promise<void>;
  updateArbitragePlan: (planId: string, updates: Partial<ArbitragePlan>) => Promise<void>;
  deleteArbitragePlan: (planId: string) => Promise<void>;
  addArbitragePlan: (plan: Omit<ArbitragePlan, 'id'>) => Promise<void>;
}
