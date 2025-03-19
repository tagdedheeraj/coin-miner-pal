
import React from 'react';
import { Pickaxe, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useMining } from '@/contexts/MiningContext';
import { formatTimeRemaining, formatCoins } from '@/utils/formatters';

const MiningCard: React.FC = () => {
  const { 
    isMining, 
    startMining, 
    stopMining, 
    miningProgress, 
    timeUntilNextMining,
    coinsMinedInSession,
    miningRate,
    totalCoinsFromMining
  } = useMining();
  
  return (
    <div className="w-full">
      <div className="glass-card rounded-2xl p-6 mb-6 animate-scale-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center mr-3">
              <Pickaxe className="text-brand-teal" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Mining Status</h3>
              <p className="text-sm text-gray-500">
                {isMining 
                  ? 'Mining in progress' 
                  : timeUntilNextMining !== null 
                    ? 'Cooling down' 
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
        </div>
        
        {isMining && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Mining progress</span>
              <span className="font-medium">{Math.floor(miningProgress)}%</span>
            </div>
            <Progress value={miningProgress} className="h-2" />
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Mining rate</p>
            <p className="font-semibold">
              {miningRate} <span className="text-xs text-gray-400">coins/hour</span>
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Current session</p>
            <p className="font-semibold">
              {formatCoins(isMining ? (miningProgress / 100) * (miningRate * 24) : coinsMinedInSession)} <span className="text-xs text-gray-400">coins</span>
            </p>
          </div>
        </div>
        
        {isMining ? (
          <Button 
            onClick={stopMining}
            variant="outline" 
            className="w-full rounded-xl h-12 border-gray-200 hover:bg-gray-100 hover:text-gray-700 transition-all duration-300"
          >
            Stop Mining
          </Button>
        ) : (
          <Button 
            onClick={startMining}
            disabled={timeUntilNextMining !== null}
            className="w-full rounded-xl h-12 bg-brand-blue hover:bg-brand-blue/90 font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {timeUntilNextMining !== null ? 'Cooling Down' : 'Start Mining'}
          </Button>
        )}
      </div>
      
      <div className="glass-card rounded-2xl p-6 animate-scale-up animation-delay-100">
        <h3 className="font-semibold text-lg mb-3">Mining Stats</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm text-gray-500">Total mined</p>
              <p className="font-medium">{formatCoins(totalCoinsFromMining)} coins</p>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm text-gray-500">Current session</p>
              <p className="font-medium">{formatCoins(isMining ? (miningProgress / 100) * (miningRate * 24) : coinsMinedInSession)} coins</p>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm text-gray-500">Mining rate</p>
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
