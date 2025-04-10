
import { User } from '@/types/auth';
import { toast } from 'sonner';

export const rejectDepositFunctions = (user: User | null) => {
  const rejectDepositRequest = async (requestId: string): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can reject deposit requests');
      return;
    }
    
    try {
      // Get deposit requests from local storage
      const depositRequestsJson = localStorage.getItem('depositRequests');
      const depositRequests = depositRequestsJson ? JSON.parse(depositRequestsJson) : [];
      
      // Update the request status
      const updatedRequests = depositRequests.map(req =>
        req.id === requestId
          ? { ...req, status: 'rejected', reviewedAt: new Date().toISOString() }
          : req
      );
      
      // Save updated requests
      localStorage.setItem('depositRequests', JSON.stringify(updatedRequests));
      
      toast.success('Deposit request rejected successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to reject deposit request');
    }
  };

  return { rejectDepositRequest };
};
