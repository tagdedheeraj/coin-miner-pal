
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, LayoutGrid, DollarSign, Coins, BellRing, FileText, CreditCard } from 'lucide-react';
import UserManagement from './users/UserManagement';
import UsdtEarningsManager from './earnings/UsdtEarningsManager';
import CoinsManager from './coins/CoinsManager';
import NotificationManager from './notifications/NotificationManager';
import WithdrawalRequestManager from './withdrawals/WithdrawalRequestManager';
import DepositRequestManager from './deposits/DepositRequestManager';
import ArbitragePlanManagement from './ArbitragePlanManagement';
import { WithdrawalRequest, DepositRequest, User as UserType } from '@/types/auth';

interface AdminTabsProps {
  pendingWithdrawalsCount: number;
  pendingDepositsCount: number;
  deleteUser: (userId: string) => void;
  updateUserUsdtEarnings: (email: string, amount: number) => Promise<void>;
  updateUserCoins: (email: string, amount: number) => Promise<void>;
  sendNotificationToAllUsers: (message: string) => void;
  getWithdrawalRequests: () => Promise<WithdrawalRequest[]>;
  approveWithdrawalRequest: (requestId: string) => Promise<void>;
  rejectWithdrawalRequest: (requestId: string) => Promise<void>;
  getDepositRequests: () => Promise<DepositRequest[]>;
  approveDepositRequest: (requestId: string) => Promise<void>;
  rejectDepositRequest: (requestId: string) => Promise<void>;
  users: UserType[]; // Add this prop to the interface
}

const AdminTabs: React.FC<AdminTabsProps> = ({
  pendingWithdrawalsCount,
  pendingDepositsCount,
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
  users // Add the users prop here
}) => {
  return (
    <Tabs defaultValue="users" className="w-full">
      <TabsList className="mb-6 flex flex-wrap gap-1">
        <TabsTrigger value="users" className="flex items-center gap-2">
          <User className="h-4 w-4" /> Users
        </TabsTrigger>
        <TabsTrigger value="plans" className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4" /> Arbitrage Plans
        </TabsTrigger>
        <TabsTrigger value="usdt" className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" /> USDT Earnings
        </TabsTrigger>
        <TabsTrigger value="coins" className="flex items-center gap-2">
          <Coins className="h-4 w-4" /> Coins
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-2">
          <BellRing className="h-4 w-4" /> Notifications
        </TabsTrigger>
        <TabsTrigger value="withdrawals" className="flex items-center gap-2">
          <FileText className="h-4 w-4" /> Withdrawals
          {pendingWithdrawalsCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
              {pendingWithdrawalsCount}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="deposits" className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" /> Deposits
          {pendingDepositsCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
              {pendingDepositsCount}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="users">
        <UserManagement deleteUser={deleteUser} users={users} />
      </TabsContent>
      
      <TabsContent value="plans">
        <ArbitragePlanManagement />
      </TabsContent>
      
      <TabsContent value="usdt">
        <UsdtEarningsManager updateUserUsdtEarnings={updateUserUsdtEarnings} />
      </TabsContent>

      <TabsContent value="coins">
        <CoinsManager updateUserCoins={updateUserCoins} />
      </TabsContent>
      
      <TabsContent value="notifications">
        <NotificationManager sendNotificationToAllUsers={sendNotificationToAllUsers} />
      </TabsContent>
      
      <TabsContent value="withdrawals">
        <WithdrawalRequestManager 
          getWithdrawalRequests={getWithdrawalRequests}
          approveWithdrawalRequest={approveWithdrawalRequest}
          rejectWithdrawalRequest={rejectWithdrawalRequest}
        />
      </TabsContent>
      
      <TabsContent value="deposits">
        <DepositRequestManager 
          getDepositRequests={getDepositRequests}
          approveDepositRequest={approveDepositRequest}
          rejectDepositRequest={rejectDepositRequest}
        />
      </TabsContent>
    </Tabs>
  );
};

export default AdminTabs;
