
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import Header from '@/components/layout/Header';
import { WithdrawalRequest, DepositRequest, User } from '@/types/auth';
import AdminTabs from '@/components/admin/AdminTabs';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { LayoutGrid, User as UserIcon, DollarSign, ArrowUpDown } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const isMobile = useIsMobile();
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

  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.isAdmin) {
        setIsLoading(true);
        try {
          const [withdrawals, deposits, users] = await Promise.all([
            getWithdrawalRequests(),
            getDepositRequests(),
            getAllUsers ? getAllUsers() : Promise.resolve([])
          ]);

          setWithdrawalRequests(withdrawals);
          setDepositRequests(deposits);
          setAllUsers(users);
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

  const refreshData = async () => {
    if (!user?.isAdmin) return;
    setIsLoading(true);
    toast.info('Refreshing admin data...');
    
    try {
      const [withdrawals, deposits, users] = await Promise.all([
        getWithdrawalRequests(),
        getDepositRequests(),
        getAllUsers ? getAllUsers() : Promise.resolve([])
      ]);

      setWithdrawalRequests(withdrawals);
      setDepositRequests(deposits);
      setAllUsers(users);
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

  // Fixed the TypeScript error by using optional chaining and accessing the correct property name
  const activeUserPlans = allUsers.reduce((acc, user) => 
    acc + (user.activePlans?.length || 0), 0);

  // Dashboard stats
  const stats = [
    {
      title: "कुल उपयोगकर्ता",
      value: allUsers.length,
      icon: UserIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "लंबित निकासी",
      value: pendingWithdrawals.length,
      icon: ArrowUpDown,
      color: "text-amber-600",
      bgColor: "bg-amber-100"
    },
    {
      title: "लंबित जमा",
      value: pendingDeposits.length,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "सक्रिय योजनाएँ",
      value: activeUserPlans,
      icon: LayoutGrid,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">एडमिन पैनल</h1>
          <p className="mt-1 text-sm text-gray-600">प्रणाली सेटिंग्स और उपयोगकर्ता प्रबंधन</p>
        </div>

        {/* Dashboard Stats - Responsive grid */}
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 md:grid-cols-4 gap-4'} mb-6`}>
          {stats.map((stat, index) => (
            <Card key={index} className="p-4 transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="overflow-hidden">
                  <p className={`text-xs ${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-600 truncate`}>{stat.title}</p>
                  <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold mt-1`}>{stat.value}</p>
                </div>
                <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} ${stat.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Refresh Button */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'लोड हो रहा है...' : 'डेटा रीफ्रेश करें'}
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <Card className={`${isMobile ? 'p-2' : 'p-4'} overflow-hidden`}>
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
          </Card>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
