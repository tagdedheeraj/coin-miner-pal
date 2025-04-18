import React from 'react';
import { Pickaxe, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useMining } from '@/contexts/mining/MiningContext';
import { formatTimeRemaining, formatCoins } from '@/utils/formatters';

const MiningCard: React.FC = () => {
  const { 
    isMining, 
    startMining, 
    miningProgress, 
    timeUntilNextMining,
    timeUntilMiningCompletes,
    coinsMinedInSession,
    miningRate,
    totalCoinsFromMining,
    isLoadingMiningState
  } = useMining();
  
  if (isLoadingMiningState) {
    return (
      <div className="w-full">
        <div className="glass-card rounded-2xl p-6 mb-6 animate-scale-up flex flex-col items-center justify-center min-h-[200px]">
          <Loader2 className="w-12 h-12 text-brand-blue animate-spin mb-4" />
          <p className="text-gray-500">Loading mining data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <div className="glass-card rounded-2xl p-6 mb-6 animate-scale-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center mr-3">
              <Pickaxe className={`${isMining ? 'animate-pulse text-brand-teal' : 'text-brand-teal'}`} size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Mining Status</h3>
              <p className="text-sm text-gray-500">
                {isMining 
                  ? 'Mining in progress' 
                  : timeUntilNextMining !== null 
                    ? 'Cooldown in progress' 
                    : 'Ready to start'}
              </p>
            </div>
          </div>
          
          {!isMining && timeUntilNextMining !== null && (
            <div className="flex items-center bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-medium">
              <Clock size={14} className="mr-1" />
              <span>{formatTimeRemaining(timeUntilNextMining)}</span>
            </div>
          )}
          
          {isMining && timeUntilMiningCompletes !== null && (
            <div className="flex items-center bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-medium">
              <Clock size={14} className="mr-1" />
              <span>{formatTimeRemaining(timeUntilMiningCompletes)}</span>
            </div>
          )}
        </div>
        
        {isMining && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Mining Progress</span>
              <span className="font-medium">{Math.floor(miningProgress)}%</span>
            </div>
            <Progress value={miningProgress} className="h-2" />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Mining continues even when app is closed
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Mining Rate</p>
            <p className="font-semibold">
              {miningRate} <span className="text-xs text-gray-400">coins/hour</span>
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Current Session</p>
            <p className="font-semibold">
              {formatCoins(isMining ? (miningProgress / 100) * (miningRate * 24) : coinsMinedInSession)} <span className="text-xs text-gray-400">coins</span>
            </p>
          </div>
        </div>
        
        <Button 
          onClick={isMining ? undefined : startMining}
          disabled={timeUntilNextMining !== null || isMining}
          className={`w-full rounded-xl h-12 ${
            isMining 
              ? 'bg-gray-100 text-gray-700 cursor-not-allowed hover:bg-gray-100'
              : 'bg-brand-blue hover:bg-brand-blue/90'
          } font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98]`}
        >
          {isMining ? 'Mining in Progress' : timeUntilNextMining !== null ? 'Cooldown in Progress' : 'Start Mining'}
        </Button>
      </div>
      
      <div className="glass-card rounded-2xl p-6 animate-scale-up animation-delay-100">
        <h3 className="font-semibold text-lg mb-3">Mining Statistics</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm text-gray-500">Total Mined</p>
              <p className="font-medium">{formatCoins(totalCoinsFromMining)} coins</p>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm text-gray-500">Current Session</p>
              <p className="font-medium">{formatCoins(isMining ? (miningProgress / 100) * (miningRate * 24) : coinsMinedInSession)} coins</p>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm text-gray-500">Mining Rate</p>
              <p className="font-medium">{miningRate} coins per hour</p>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiningCard;
