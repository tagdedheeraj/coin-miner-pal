
import React from 'react';
import { Pickaxe, Gift, Share2, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types/auth';
import { useMining } from '@/contexts/MiningContext';
import { formatCoins } from '@/utils/formatters';

interface DashboardItemsProps {
  user: User | null;
}

const DashboardItems: React.FC<DashboardItemsProps> = ({ user }) => {
  const navigate = useNavigate();
  const { totalCoinsFromMining } = useMining();
  
  const dashboardItems = [
    { 
      icon: Pickaxe, 
      color: 'text-brand-teal', 
      bgColor: 'bg-brand-teal/10',
      title: 'Mining',
      value: totalCoinsFromMining,
      label: 'coins mined',
      path: '/mining'
    },
    { 
      icon: Gift, 
      color: 'text-brand-pink', 
      bgColor: 'bg-brand-pink/10',
      title: 'Rewards',
      value: 10,
      label: 'daily ads',
      path: '/rewards'
    },
    { 
      icon: Share2, 
      color: 'text-brand-indigo', 
      bgColor: 'bg-brand-indigo/10',
      title: 'Refer',
      value: 250,
      label: 'coins per referral',
      path: '/referral'
    },
    { 
      icon: Wallet, 
      color: 'text-brand-green', 
      bgColor: 'bg-brand-green/10',
      title: 'Wallet',
      value: user?.coins || 0,
      label: 'available coins',
      path: '/wallet'
    },
  ];
  
  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      {dashboardItems.map((item, index) => (
        <div 
          key={index}
          className="glass-card rounded-xl p-4 animate-scale-up cursor-pointer"
          style={{ animationDelay: `${index * 50}ms` }}
          onClick={() => navigate(item.path)}
        >
          <div className="flex items-center mb-3">
            <div className={`w-8 h-8 rounded-full ${item.bgColor} flex items-center justify-center mr-2`}>
              <item.icon className={item.color} size={16} />
            </div>
            <p className="font-medium text-sm">{item.title}</p>
          </div>
          
          <p className="text-lg font-bold mb-1">{typeof item.value === 'number' ? formatCoins(item.value) : item.value}</p>
          <p className="text-xs text-gray-500">{item.label}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardItems;
