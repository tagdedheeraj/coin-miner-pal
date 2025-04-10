
import React from 'react';
import { User } from '@/types/auth';
import { formatCoins, formatUSD, formatTimeRemaining } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { useMining } from '@/contexts/MiningContext';

interface BalanceCardProps {
  user: User | null;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ user }) => {
  const navigate = useNavigate();
  const { 
    isMining, 
    startMining, 
    miningProgress, 
    timeUntilNextMining
  } = useMining();
  
  return (
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
  );
};

export default BalanceCard;
