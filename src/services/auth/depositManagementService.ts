
import { User, DepositRequest } from '@/types/auth';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export const depositManagementServiceFunctions = () => {
  const getDepositRequests = async (): Promise<DepositRequest[]> => {
    const depositRequestsJson = localStorage.getItem('depositRequests');
    return depositRequestsJson ? JSON.parse(depositRequestsJson) : [];
  };

  const saveDepositRequests = async (requests: DepositRequest[]): Promise<void> => {
    localStorage.setItem('depositRequests', JSON.stringify(requests));
  };

  const getUserDepositRequests = async (userId: string | undefined): Promise<DepositRequest[]> => {
    if (!userId) return [];
    
    const depositRequests = await getDepositRequests();
    return depositRequests.filter(req => req.userId === userId);
  };

  const requestPlanPurchase = async (depositRequest: Omit<DepositRequest, 'id' | 'status' | 'reviewedAt'>): Promise<void> => {
    const depositRequests = await getDepositRequests();
    
    const newDeposit: DepositRequest = {
      id: uuidv4(),
      ...depositRequest,
      status: 'pending',
    };
    
    await saveDepositRequests([...depositRequests, newDeposit]);
    toast.success('Plan purchase requested successfully');
  };

  const approveDepositRequest = async (requestId: string): Promise<void> => {
    const depositRequests = await getDepositRequests();
    
    const updatedRequests = depositRequests.map(req =>
      req.id === requestId
        ? { ...req, status: 'approved' as const, reviewedAt: new Date().toISOString() }
        : req
    );
    
    await saveDepositRequests(updatedRequests);
    toast.success('Deposit approved');
  };

  const rejectDepositRequest = async (requestId: string): Promise<void> => {
    const depositRequests = await getDepositRequests();
    
    const updatedRequests = depositRequests.map(req =>
      req.id === requestId
        ? { ...req, status: 'rejected' as const, reviewedAt: new Date().toISOString() }
        : req
    );
    
    await saveDepositRequests(updatedRequests);
    toast.success('Deposit rejected');
  };

  return {
    getDepositRequests,
    getUserDepositRequests,
    requestPlanPurchase,
    approveDepositRequest,
    rejectDepositRequest
  };
};
