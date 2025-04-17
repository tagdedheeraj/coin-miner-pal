
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
import { useIsMobile } from '@/hooks/use-mobile';

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
  users
}) => {
  const isMobile = useIsMobile();
  
  return (
    <Tabs defaultValue="users" className="w-full">
      <TabsList className={`${isMobile ? 'flex-wrap grid grid-cols-3 gap-1 h-auto p-1' : 'flex flex-wrap gap-1'} mb-6`}>
        <TabsTrigger value="users" className="flex items-center gap-1 text-xs md:text-sm py-1.5 h-auto">
          <User className="h-3 w-3 md:h-4 md:w-4" /> 
          <span className="truncate">Users</span>
        </TabsTrigger>
        
        <TabsTrigger value="plans" className="flex items-center gap-1 text-xs md:text-sm py-1.5 h-auto">
          <LayoutGrid className="h-3 w-3 md:h-4 md:w-4" /> 
          <span className="truncate">Plans</span>
        </TabsTrigger>
        
        <TabsTrigger value="usdt" className="flex items-center gap-1 text-xs md:text-sm py-1.5 h-auto">
          <DollarSign className="h-3 w-3 md:h-4 md:w-4" /> 
          <span className="truncate">USDT</span>
        </TabsTrigger>
        
        <TabsTrigger value="coins" className="flex items-center gap-1 text-xs md:text-sm py-1.5 h-auto">
          <Coins className="h-3 w-3 md:h-4 md:w-4" /> 
          <span className="truncate">Coins</span>
        </TabsTrigger>
        
        <TabsTrigger value="notifications" className="flex items-center gap-1 text-xs md:text-sm py-1.5 h-auto">
          <BellRing className="h-3 w-3 md:h-4 md:w-4" /> 
          <span className="truncate">Notif.</span>
        </TabsTrigger>
        
        <TabsTrigger value="withdrawals" className="flex items-center gap-1 text-xs md:text-sm py-1.5 h-auto">
          <FileText className="h-3 w-3 md:h-4 md:w-4" /> 
          <span className="truncate">Withdrawals</span>
          {pendingWithdrawalsCount > 0 && (
            <span className="ml-0.5 px-1.5 py-0.5 text-[10px] md:text-xs bg-red-500 text-white rounded-full">
              {pendingWithdrawalsCount}
            </span>
          )}
        </TabsTrigger>
        
        <TabsTrigger value="deposits" className="flex items-center gap-1 text-xs md:text-sm py-1.5 h-auto">
          <CreditCard className="h-3 w-3 md:h-4 md:w-4" /> 
          <span className="truncate">Deposits</span>
          {pendingDepositsCount > 0 && (
            <span className="ml-0.5 px-1.5 py-0.5 text-[10px] md:text-xs bg-red-500 text-white rounded-full">
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
