
import React, { createContext, useContext, useEffect } from 'react';
import { MiningContextType } from './types';
import { useMiningOperations } from './useMiningOperations';
import { useMiningCooldown } from './hooks/useMiningCooldown';
import { useInitialMiningState } from './hooks/useInitialMiningState';
import { useMiningSync } from './hooks/useMiningSync';
import { useMiningActions } from './hooks/useMiningActions';
import { calculateTimeUntilCompletion } from './utils';

const MiningContext = createContext<MiningContextType | undefined>(undefined);

export const MiningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    miningRate,
    miningStartTime,
    setMiningStartTime
  } = useMiningOperations();

  const { timeUntilNextMining, setTimeUntilNextMining } = useMiningCooldown(lastMiningDate);
  const { isLoadingMiningState, initialLoadComplete, miningStateData } = useInitialMiningState();

  // Initialize Firebase sync
  useMiningSync({
    isMining,
    miningProgress,
    lastMiningDate,
    miningStartTime,
    coinsMinedInSession,
    totalCoinsFromMining,
    initialLoadComplete
  });

  // Initialize state from Firebase or localStorage when loaded
  useEffect(() => {
    if (miningStateData && initialLoadComplete) {
      console.log("Initializing mining state from loaded data:", miningStateData);
      setIsMining(miningStateData.isMining);
      setMiningProgress(miningStateData.miningProgress);
      setLastMiningDate(miningStateData.lastMiningDate);
      setCoinsMinedInSession(miningStateData.coinsMinedInSession);
      setTotalCoinsFromMining(miningStateData.totalCoinsFromMining);
      setMiningStartTime(miningStateData.miningStartTime);
    }
  }, [miningStateData, initialLoadComplete]);

  const { startMining, resetMiningCooldown } = useMiningActions({
    setIsMining,
    setMiningProgress,
    setCoinsMinedInSession,
    setMiningStartTime,
    setLastMiningDate,
    setTimeUntilNextMining
  });
  
  const timeUntilMiningCompletes = miningStartTime 
    ? calculateTimeUntilCompletion(miningStartTime.toISOString(), miningProgress) 
    : null;
  
  const value = {
    isMining,
    startMining,
    stopMining: () => {}, // Added to satisfy type but not used since we removed the stop functionality
    miningProgress,
    timeUntilNextMining,
    timeUntilMiningCompletes,
    coinsMinedInSession,
    miningRate,
    totalCoinsFromMining,
    resetMiningCooldown,
    miningStartTime,
    isLoadingMiningState
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
