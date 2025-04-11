
import { User, ArbitragePlan, WithdrawalRequest, DepositRequest } from '@/types/auth';
import { FullAuthContextType as BaseAuthContextType } from './types';

// Extend the base AuthContextType with our getAllUsers function
export interface FullAuthContextType extends BaseAuthContextType {
  getAllUsers?: () => Promise<User[]>;
}
