
import { User, WithdrawalRequest } from '@/types/auth';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Dispatch, SetStateAction } from 'react';

export const withdrawalManagementServiceFunctions = (
  user: User | null,
  setUser: Dispatch<SetStateAction<User | null>>
) => {
  const getWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
    const withdrawalRequestsJson = localStorage.getItem('withdrawalRequests');
    return withdrawalRequestsJson ? JSON.parse(withdrawalRequestsJson) : [];
  };

  const saveWithdrawalRequests = async (requests: WithdrawalRequest[]): Promise<void> => {
    localStorage.setItem('withdrawalRequests', JSON.stringify(requests));
  };

  const requestWithdrawal = async (amount: number): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    
    if (!user.withdrawalAddress) {
      toast.error('Please set a withdrawal address first');
      return;
    }
    
    if (user.usdtEarnings && amount > user.usdtEarnings) {
      toast.error('Insufficient USDT balance');
      return;
    }
    
    const withdrawalRequests = await getWithdrawalRequests();
    
    const newWithdrawal: WithdrawalRequest = {
      id: uuidv4(),
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      amount,
      address: user.withdrawalAddress,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    await saveWithdrawalRequests([...withdrawalRequests, newWithdrawal]);
    
    // Update user's USDT earnings
    setUser({
      ...user,
      usdtEarnings: (user.usdtEarnings || 0) - amount
    });
    
    toast.success('Withdrawal requested successfully');
  };

  const approveWithdrawalRequest = async (requestId: string): Promise<void> => {
    const withdrawalRequests = await getWithdrawalRequests();
    
    const updatedRequests = withdrawalRequests.map(req =>
      req.id === requestId
        ? { ...req, status: 'approved' as const, updatedAt: new Date().toISOString() }
        : req
    );
    
    await saveWithdrawalRequests(updatedRequests);
    toast.success('Withdrawal approved');
  };

  const rejectWithdrawalRequest = async (requestId: string): Promise<void> => {
    const withdrawalRequests = await getWithdrawalRequests();
    
    const requestToReject = withdrawalRequests.find(req => req.id === requestId);
    if (!requestToReject) {
      toast.error('Withdrawal request not found');
      return;
    }
    
    const updatedRequests = withdrawalRequests.map(req =>
      req.id === requestId
        ? { ...req, status: 'rejected' as const, updatedAt: new Date().toISOString() }
        : req
    );
    
    await saveWithdrawalRequests(updatedRequests);
    toast.success('Withdrawal rejected');
  };

  return {
    getWithdrawalRequests,
    requestWithdrawal,
    approveWithdrawalRequest,
    rejectWithdrawalRequest
  };
};
