
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import { WithdrawalRequest, DepositRequest } from '@/types/auth';
import AdminTabs from '@/components/admin/AdminTabs';

const AdminPanel: React.FC = () => {
  const { 
    user, 
    isAuthenticated, 
    deleteUser, 
    updateUserUsdtEarnings, 
    updateUserCoins, 
    sendNotificationToAllUsers,
    getWithdrawalRequests,
    approveWithdrawalRequest,
    rejectWithdrawalRequest,
    getDepositRequests,
    approveDepositRequest,
    rejectDepositRequest
  } = useAuth();
  const navigate = useNavigate();
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  
  useEffect(() => {
    const fetchRequests = async () => {
      if (user?.isAdmin) {
        try {
          const withdrawals = await getWithdrawalRequests();
          setWithdrawalRequests(withdrawals);
          
          const deposits = await getDepositRequests();
          setDepositRequests(deposits);
        } catch (error) {
          console.error('Error fetching requests:', error);
        }
      }
    };
    
    fetchRequests();
  }, [user, getWithdrawalRequests, getDepositRequests]);
  
  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/sign-in" replace />;
  }
  
  const pendingWithdrawals = withdrawalRequests.filter(req => req.status === 'pending');
  const pendingDeposits = depositRequests.filter(req => req.status === 'pending');
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-16">
      <Header />
      
      <main className="container px-4 py-6 mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Admin Panel</h1>
          <p className="text-gray-500">Manage users and system settings</p>
        </div>
        
        <AdminTabs 
          pendingWithdrawalsCount={pendingWithdrawals.length}
          pendingDepositsCount={pendingDeposits.length}
          deleteUser={deleteUser}
          updateUserUsdtEarnings={updateUserUsdtEarnings}
          updateUserCoins={updateUserCoins}
          sendNotificationToAllUsers={sendNotificationToAllUsers}
          getWithdrawalRequests={getWithdrawalRequests}
          approveWithdrawalRequest={approveWithdrawalRequest}
          rejectWithdrawalRequest={rejectWithdrawalRequest}
          getDepositRequests={getDepositRequests}
          approveDepositRequest={approveDepositRequest}
          rejectDepositRequest={rejectDepositRequest}
        />
      </main>
    </div>
  );
};

export default AdminPanel;
