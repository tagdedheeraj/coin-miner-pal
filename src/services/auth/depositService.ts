
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { createDepositRequestFunctions } from './deposit/requestDeposit';
import { getDepositFunctions } from './deposit/getDeposits';
import { approveDepositFunctions } from './deposit/approveDeposit';
import { rejectDepositFunctions } from './deposit/rejectDeposit';

export const depositServiceFunctions = (
  user: User | null,
  setUser: Dispatch<SetStateAction<User | null>>
) => {
  // Initialize the deposit sub-functions
  const { requestPlanPurchase } = createDepositRequestFunctions(user, setUser);
  const { getDepositRequests } = getDepositFunctions(user);
  const { approveDepositRequest } = approveDepositFunctions(user);
  const { rejectDepositRequest } = rejectDepositFunctions(user);
  
  return {
    requestPlanPurchase,
    getDepositRequests,
    approveDepositRequest,
    rejectDepositRequest
  };
};
