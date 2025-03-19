
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { Pickaxe, Gift, Share2, Wallet, ArrowRight } from 'lucide-react';
import { useMining } from '@/contexts/MiningContext';
import { formatCoins, formatUSD, formatTimeRemaining } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { 
    isMining, 
    startMining, 
    miningProgress, 
    timeUntilNextMining,
    totalCoinsFromMining
  } = useMining();
  const navigate = useNavigate();
  
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }
  
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
    <div className="min-h-screen bg-gray-50 pb-20 pt-16">
      <Header />
      
      <main className="container px-4 py-6 max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Welcome, {user?.name.split(' ')[0]}</h1>
          <p className="text-gray-500">Your mining dashboard</p>
        </div>
        
        <div className="glass-card rounded-2xl p-6 mb-6 animate-scale-up">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Your Balance</p>
              <p className="text-3xl font-bold">{formatCoins(user?.coins || 0)}</p>
              <p className="text-sm text-gray-500">{formatUSD(user?.coins || 0)}</p>
            </div>
            <div className="coin">₹</div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium">Mining Status</p>
              <div className="text-xs bg-brand-blue/10 text-brand-blue px-2 py-1 rounded-full">
                {isMining ? 'Active' : timeUntilNextMining ? 'Cooldown' : 'Ready'}
              </div>
            </div>
            
            {isMining && (
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500">Progress</span>
                  <span>{Math.floor(miningProgress)}%</span>
                </div>
                <Progress value={miningProgress} className="h-1.5" />
              </div>
            )}
            
            {!isMining && timeUntilNextMining && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">Next mining in</p>
                <p className="text-sm font-medium">{formatTimeRemaining(timeUntilNextMining)}</p>
              </div>
            )}
            
            {!isMining && !timeUntilNextMining && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">Ready to mine</p>
                <Button 
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 bg-white"
                  onClick={() => navigate('/mining')}
                >
                  Start Mining
                </Button>
              </div>
            )}
          </div>
        </div>
        
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
        
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
          
          <div className="space-y-3">
            <button 
              className="w-full glass-card rounded-xl p-4 flex items-center justify-between animate-scale-up"
              onClick={() => navigate('/mining')}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center mr-3">
                  <Pickaxe className="text-brand-teal" size={20} />
                </div>
                <div>
                  <p className="font-medium text-left">Start Mining</p>
                  <p className="text-xs text-gray-500">Earn 2 coins per hour</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-gray-400" />
            </button>
            
            <button 
              className="w-full glass-card rounded-xl p-4 flex items-center justify-between animate-scale-up animation-delay-100"
              onClick={() => navigate('/rewards')}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-brand-pink/10 flex items-center justify-center mr-3">
                  <Gift className="text-brand-pink" size={20} />
                </div>
                <div>
                  <p className="font-medium text-left">Watch Ads</p>
                  <p className="text-xs text-gray-500">Earn 1 coin per ad</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-gray-400" />
            </button>
            
            <button 
              className="w-full glass-card rounded-xl p-4 flex items-center justify-between animate-scale-up animation-delay-200"
              onClick={() => navigate('/referral')}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-brand-indigo/10 flex items-center justify-center mr-3">
                  <Share2 className="text-brand-indigo" size={20} />
                </div>
                <div>
                  <p className="font-medium text-left">Refer Friends</p>
                  <p className="text-xs text-gray-500">Earn 250 coins per referral</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-gray-400" />
            </button>
          </div>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Dashboard;
