
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCcw } from 'lucide-react';

interface PlansHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isRefreshing?: boolean;
}

const PlansHeader: React.FC<PlansHeaderProps> = ({ activeTab, setActiveTab, isRefreshing = false }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {isRefreshing && (
        <div className="ml-2">
          <RefreshCcw className="h-4 w-4 animate-spin text-gray-500" />
        </div>
      )}
    </div>
  );
};

export default PlansHeader;
