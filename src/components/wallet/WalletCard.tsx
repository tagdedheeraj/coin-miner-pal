
import React, { useState } from 'react';
import { Wallet, BarChart4, History } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WalletTab from './tabs/WalletTab';
import UsdtEarningsTab from './tabs/UsdtEarningsTab';
import HistoryTab from './tabs/HistoryTab';

const WalletCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('wallet');
  
  return (
    <div className="w-full">
      <Tabs defaultValue="wallet" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="wallet">
            <Wallet className="h-4 w-4 mr-2" />
            Wallet
          </TabsTrigger>
          <TabsTrigger value="usdt-earnings">
            <BarChart4 className="h-4 w-4 mr-2" />
            USDT Earnings
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="wallet" className="mt-0">
          <WalletTab />
        </TabsContent>
        
        <TabsContent value="usdt-earnings" className="mt-0">
          <UsdtEarningsTab />
        </TabsContent>
        
        <TabsContent value="history" className="mt-0">
          <HistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WalletCard;
