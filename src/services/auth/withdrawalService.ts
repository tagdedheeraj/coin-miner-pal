
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';

import { createWithdrawalRequestFunctions } from './withdrawal/requestWithdrawal';
import { getWithdrawalRequestsFunctions } from './withdrawal/getWithdrawals';
import { approveWithdrawalFunctions } from './withdrawal/approveWithdrawal';
import { rejectWithdrawalFunctions } from './withdrawal/rejectWithdrawal';

export const withdrawalServiceFunctions = (
  user: User | null,
  setUser: Dispatch<SetStateAction<User | null>>
) => {
  // Initialize all withdrawal related functions
  const withdrawalRequestFunctions = createWithdrawalRequestFunctions(user, setUser);
  const withdrawalsFunctions = getWithdrawalRequestsFunctions(user);
  const approvalFunctions = approveWithdrawalFunctions(user);
  const rejectionFunctions = rejectWithdrawalFunctions(user);
  
  // Combine all functions
  return {
    ...withdrawalRequestFunctions,
    ...withdrawalsFunctions,
    ...approvalFunctions,
    ...rejectionFunctions
  };
};
