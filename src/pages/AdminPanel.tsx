
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import { WithdrawalRequest, DepositRequest, User } from '@/types/auth';
import AdminTabs from '@/components/admin/AdminTabs';
import { toast } from 'sonner';

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
    rejectDepositRequest,
    getAllUsers
  } = useAuth();
  const navigate = useNavigate();
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      if (user?.isAdmin) {
        setIsLoading(true);
        try {
          console.log("Fetching admin data...");
          
          // Fetch all data in parallel for better performance
          const fetchWithdrawals = getWithdrawalRequests().catch(err => {
            console.error("Error fetching withdrawals:", err);
            return [];
          });
          
          const fetchDeposits = getDepositRequests().catch(err => {
            console.error("Error fetching deposits:", err);
            return [];
          });
          
          const fetchUsers = getAllUsers ? getAllUsers().catch(err => {
            console.error("Error fetching users:", err);
            return [];
          }) : Promise.resolve([]);
          
          // Wait for all promises to resolve
          const [withdrawals, deposits, users] = await Promise.all([
            fetchWithdrawals,
            fetchDeposits,
            fetchUsers
          ]);
          
          console.log("Admin data fetched:", {
            withdrawalsCount: withdrawals.length,
            depositsCount: deposits.length,
            usersCount: users.length
          });
          
          setWithdrawalRequests(withdrawals);
          setDepositRequests(deposits);
          
          if (getAllUsers) {
            console.log("Users fetched:", users);
            setAllUsers(users);
          }
          
          toast.success('Admin data loaded successfully');
        } catch (error) {
          console.error('Error fetching admin data:', error);
          toast.error('Failed to load some admin data');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchData();
  }, [user, getWithdrawalRequests, getDepositRequests, getAllUsers]);
  
  // Add a refresh function
  const refreshData = async () => {
    if (!user?.isAdmin) return;
    
    setIsLoading(true);
    toast.info('Refreshing admin data...');
    
    try {
      if (getAllUsers) {
        const users = await getAllUsers();
        console.log("Refreshed users:", users);
        setAllUsers(users);
      }
      
      const withdrawals = await getWithdrawalRequests();
      setWithdrawalRequests(withdrawals);
      
      const deposits = await getDepositRequests();
      setDepositRequests(deposits);
      
      toast.success('Admin data refreshed');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh admin data');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/sign-in" replace />;
  }
  
  const pendingWithdrawals = withdrawalRequests.filter(req => req.status === 'pending');
  const pendingDeposits = depositRequests.filter(req => req.status === 'pending');
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-16">
      <Header />
      
      <main className="container px-4 py-6 mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Admin Panel</h1>
            <p className="text-gray-500">Manage users and system settings</p>
          </div>
          <button 
            onClick={refreshData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh Data'}
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
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
            users={allUsers}
          />
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
