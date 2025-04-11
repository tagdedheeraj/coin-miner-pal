
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import Header from '@/components/layout/Header';
import DashboardStats from '@/components/admin/dashboard/DashboardStats';
import AdminTabs from '@/components/admin/AdminTabs';

const AdminDashboard: React.FC = () => {
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
    rejectDepositRequest,
    getAllUsers
  } = useAuth();
  
  const {
    withdrawalRequests,
    depositRequests,
    dashboardStats,
    fetchWithdrawalRequests,
    fetchDepositRequests
  } = useAdminDashboard();
  
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      if (user?.isAdmin) {
        try {
          const fetchedUsers = await getAllUsers();
          setUsers(fetchedUsers);
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      }
    };
    
    fetchUsers();
  }, [user]);
  
  // Redirect non-admin users
  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/sign-in" replace />;
  }
  
  // Calculate pending requests for tab badges
  const pendingWithdrawalsCount = withdrawalRequests.filter(req => req.status === 'pending').length;
  const pendingDepositsCount = depositRequests.filter(req => req.status === 'pending').length;
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-16">
      <Header />
      
      <main className="container px-4 py-6 mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">एडमिन पैनल</h1>
          <p className="text-gray-500">अपनी वेबसाइट और ऐप को यहां से प्रबंधित करें</p>
        </div>
        
        {/* Dashboard Overview */}
        <DashboardStats 
          totalUsers={dashboardStats.totalUsers}
          activeUsers={dashboardStats.activeUsers}
          totalRevenue={dashboardStats.totalRevenue}
          pendingRequests={dashboardStats.pendingWithdrawals + dashboardStats.pendingDeposits}
        />
        
        {/* Main Admin Tabs */}
        <AdminTabs 
          pendingWithdrawalsCount={pendingWithdrawalsCount}
          pendingDepositsCount={pendingDepositsCount}
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
          users={users}
        />
      </main>
    </div>
  );
};

export default AdminDashboard;
