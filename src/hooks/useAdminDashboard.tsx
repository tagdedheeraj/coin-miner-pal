
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { WithdrawalRequest, DepositRequest } from '@/types/auth';
import { mockUsers } from '@/data/mockUsers';

export const useAdminDashboard = () => {
  const { 
    user, 
    getWithdrawalRequests,
    getDepositRequests,
    getAllUsers
  } = useAuth();
  
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(true);
  const [loadingDeposits, setLoadingDeposits] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    pendingWithdrawals: 0,
    pendingDeposits: 0
  });
  
  // Fetch data on component mount
  useEffect(() => {
    if (user?.isAdmin) {
      fetchWithdrawalRequests();
      fetchDepositRequests();
    }
  }, [user]);
  
  // Recalculate dashboard stats whenever withdrawal or deposit requests change
  useEffect(() => {
    calculateDashboardStats();
  }, [withdrawalRequests, depositRequests]);
  
  // Fetch withdrawal requests
  const fetchWithdrawalRequests = async () => {
    try {
      const requests = await getWithdrawalRequests();
      setWithdrawalRequests(requests);
      setLoadingWithdrawals(false);
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
      setLoadingWithdrawals(false);
    }
  };
  
  // Fetch deposit requests
  const fetchDepositRequests = async () => {
    try {
      const requests = await getDepositRequests();
      setDepositRequests(requests);
      setLoadingDeposits(false);
    } catch (error) {
      console.error('Error fetching deposit requests:', error);
      setLoadingDeposits(false);
    }
  };
  
  // Calculate dashboard statistics
  const calculateDashboardStats = () => {
    setDashboardStats({
      totalUsers: mockUsers.length,
      activeUsers: mockUsers.filter(u => u.coins > 0).length,
      totalRevenue: depositRequests
        .filter(req => req.status === 'approved')
        .reduce((total, req) => total + req.amount, 0),
      pendingWithdrawals: withdrawalRequests.filter(req => req.status === 'pending').length,
      pendingDeposits: depositRequests.filter(req => req.status === 'pending').length
    });
  };

  return {
    withdrawalRequests,
    depositRequests,
    loadingWithdrawals,
    loadingDeposits,
    dashboardStats,
    fetchWithdrawalRequests,
    fetchDepositRequests
  };
};
