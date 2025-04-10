
import { User, WithdrawalRequest } from '@/types/auth';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import createWithdrawalRequestFunctions from './withdrawal/requestWithdrawal';

export const getWithdrawalFunctions = (user: User | null, setUser: React.Dispatch<React.SetStateAction<User | null>>) => {
  // Create the withdrawal request functions with the current user and setter
  const { requestWithdrawal } = createWithdrawalRequestFunctions(user, setUser);

  // Get all withdrawal requests
  const getWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
    // In local storage version, we get from localStorage
    const withdrawalRequestsJson = localStorage.getItem('withdrawalRequests');
    return withdrawalRequestsJson ? JSON.parse(withdrawalRequestsJson) : [];
  };

  // Get user's withdrawal requests
  const getUserWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
    if (!user) return [];
    
    const withdrawalRequests = await getWithdrawalRequests();
    return withdrawalRequests.filter(req => req.userId === user.id);
  };

  // Update a withdrawal request in localStorage
  const updateWithdrawalRequest = async (requestId: string, updates: Partial<WithdrawalRequest>): Promise<void> => {
    const withdrawalRequests = await getWithdrawalRequests();
    
    const updatedRequests = withdrawalRequests.map(req =>
      req.id === requestId ? { ...req, ...updates } : req
    );
    
    localStorage.setItem('withdrawalRequests', JSON.stringify(updatedRequests));
  };

  return {
    requestWithdrawal,
    getWithdrawalRequests,
    getUserWithdrawalRequests,
    updateWithdrawalRequest
  };
};
