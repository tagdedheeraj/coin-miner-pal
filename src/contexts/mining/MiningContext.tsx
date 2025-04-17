
import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { MiningContextType } from './types';
import { useMiningOperations } from './useMiningOperations';
import { loadMiningState } from './utils';
import { useMiningCooldown } from './hooks/useMiningCooldown';
import { useMiningNotifications } from '@/components/mining/MiningNotifications';

const MiningContext = createContext<MiningContextType | undefined>(undefined);

export const MiningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const {
    isMining,
    setIsMining,
    miningProgress,
    setMiningProgress,
    coinsMinedInSession,
    setCoinsMinedInSession,
    lastMiningDate,
    setLastMiningDate,
    totalCoinsFromMining,
    setTotalCoinsFromMining,
    miningRate
  } = useMiningOperations();

  const { timeUntilNextMining, setTimeUntilNextMining } = useMiningCooldown(lastMiningDate);

  const notifications = useMiningNotifications({
    isMining,
    miningProgress,
    miningRate,
    coinsMinedInSession
  });
  
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
  
  const startMining = () => {
    if (timeUntilNextMining !== null) {
      notifications.handleCooldownError();
      return;
    }
    
    setIsMining(true);
    setMiningProgress(0);
    setCoinsMinedInSession(0);
    notifications.handleMiningStart();
  };
  
  const stopMining = () => {
    if (!isMining) return;
    
    setIsMining(false);
    notifications.handleMiningStop();
  };
  
  const resetMiningCooldown = () => {
    setLastMiningDate(null);
    setTimeUntilNextMining(null);
    notifications.handleCooldownReset();
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
