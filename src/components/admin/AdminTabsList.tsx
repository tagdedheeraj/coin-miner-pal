
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, LayoutGrid, DollarSign, Coins, BellRing } from 'lucide-react';

const AdminTabsList: React.FC = () => {
  return (
    <TabsList className="mb-6 flex flex-wrap gap-1">
      <TabsTrigger value="users" className="flex items-center gap-2">
        <User className="h-4 w-4" /> Users
      </TabsTrigger>
      <TabsTrigger value="plans" className="flex items-center gap-2">
        <LayoutGrid className="h-4 w-4" /> Arbitrage Plans
      </TabsTrigger>
      <TabsTrigger value="usdt" className="flex items-center gap-2">
        <DollarSign className="h-4 w-4" /> USDT Management
      </TabsTrigger>
      <TabsTrigger value="coins" className="flex items-center gap-2">
        <Coins className="h-4 w-4" /> Coins Management
      </TabsTrigger>
      <TabsTrigger value="notifications" className="flex items-center gap-2">
        <BellRing className="h-4 w-4" /> Notifications
      </TabsTrigger>
    </TabsList>
  );
};

export default AdminTabsList;
