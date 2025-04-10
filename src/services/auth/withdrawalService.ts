
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { createWithdrawalRequestFunctions } from './withdrawal/requestWithdrawal';
import { getWithdrawalFunctions } from './withdrawal/getWithdrawals';
import { approveWithdrawalFunctions } from './withdrawal/approveWithdrawal';
import { rejectWithdrawalFunctions } from './withdrawal/rejectWithdrawal';

export const withdrawalServiceFunctions = (
  user: User | null,
  setUser: Dispatch<SetStateAction<User | null>>
) => {
  // Initialize the withdrawal sub-functions
  const { requestWithdrawal } = createWithdrawalRequestFunctions(user, setUser);
  const { getWithdrawalRequests } = getWithdrawalFunctions(user);
  const { approveWithdrawalRequest } = approveWithdrawalFunctions(user);
  const { rejectWithdrawalRequest } = rejectWithdrawalFunctions(user);
  
  return {
    requestWithdrawal,
    getWithdrawalRequests,
    approveWithdrawalRequest,
    rejectWithdrawalRequest
  };
};
