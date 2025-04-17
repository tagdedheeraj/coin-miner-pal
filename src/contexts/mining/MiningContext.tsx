
import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { MiningContextType } from './types';
import { useMiningOperations } from './useMiningOperations';
import { loadMiningState, HOUR_IN_MS } from './utils';

const MiningContext = createContext<MiningContextType | undefined>(undefined);

export const MiningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const {
    isMining,
    setIsMining,
    miningProgress,
    setMiningProgress,
    timeUntilNextMining,
    setTimeUntilNextMining,
    coinsMinedInSession,
    setCoinsMinedInSession,
    lastMiningDate,
    setLastMiningDate,
    totalCoinsFromMining,
    setTotalCoinsFromMining,
    miningRate
  } = useMiningOperations();
  
  // Load saved mining state on mount
  useEffect(() => {
    if (user) {
      const savedState = loadMiningState(user.id);
      if (savedState) {
        setIsMining(savedState.isMining);
        setMiningProgress(savedState.miningProgress);
        setLastMiningDate(savedState.lastMiningDate ? new Date(savedState.lastMiningDate) : null);
        setCoinsMinedInSession(savedState.coinsMinedInSession || 0);
        setTotalCoinsFromMining(savedState.totalCoinsFromMining || 0);
      } else {
        // Reset for new user
        setIsMining(false);
        setMiningProgress(0);
        setTimeUntilNextMining(null);
        setCoinsMinedInSession(0);
        setLastMiningDate(null);
        setTotalCoinsFromMining(0);
      }
    }
  }, [user?.id]);
  
  // Cooldown timer effect
  useEffect(() => {
    if (!lastMiningDate) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = now.getTime() - lastMiningDate.getTime();
      const cooldownTime = 24 * HOUR_IN_MS; // 24 hours cooldown
      
      if (elapsed >= cooldownTime) {
        setTimeUntilNextMining(null);
        setLastMiningDate(null);
        clearInterval(interval);
      } else {
        setTimeUntilNextMining(cooldownTime - elapsed);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [lastMiningDate]);
  
  const startMining = () => {
    if (timeUntilNextMining !== null) {
      toast.error('Mining is on cooldown. Please wait until the cooldown period ends.');
      return;
    }
    
    setIsMining(true);
    setMiningProgress(0);
    setCoinsMinedInSession(0);
    toast.success('Mining started!');
  };
  
  const stopMining = () => {
    if (!isMining) return;
    
    setIsMining(false);
    toast.info('Mining stopped.');
  };
  
  const resetMiningCooldown = () => {
    setLastMiningDate(null);
    setTimeUntilNextMining(null);
    toast.success('Mining cooldown reset!');
  };
  
  const value = {
    isMining,
    startMining,
    stopMining,
    miningProgress,
    timeUntilNextMining,
    coinsMinedInSession,
    miningRate,
    totalCoinsFromMining,
    resetMiningCooldown,
  };
  
  return <MiningContext.Provider value={value}>{children}</MiningContext.Provider>;
};

export const useMining = () => {
  const context = useContext(MiningContext);
  if (context === undefined) {
    throw new Error('useMining must be used within a MiningProvider');
  }
  return context;
};
