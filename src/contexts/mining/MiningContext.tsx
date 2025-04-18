
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { MiningContextType } from './types';
import { useMiningOperations } from './useMiningOperations';
import { loadMiningState, saveMiningState, calculateTimeUntilCompletion } from './utils';
import { useMiningCooldown } from './hooks/useMiningCooldown';
import { useMiningNotifications } from '@/components/mining/MiningNotifications';

const MiningContext = createContext<MiningContextType | undefined>(undefined);

export const MiningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
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

  const notifications = useMiningNotifications({
    isMining,
    miningProgress,
    miningRate,
    coinsMinedInSession
  });
  
  // Load saved mining state on mount or when user changes
  useEffect(() => {
    if (user && !initialLoadComplete) {
      const savedState = loadMiningState(user.id);
      
      if (savedState) {
        // Restore mining state
        setIsMining(savedState.isMining);
        setMiningProgress(savedState.miningProgress);
        setLastMiningDate(savedState.lastMiningDate ? new Date(savedState.lastMiningDate) : null);
        setCoinsMinedInSession(savedState.coinsMinedInSession || 0);
        setTotalCoinsFromMining(savedState.totalCoinsFromMining || 0);
        setMiningStartTime(savedState.miningStartTime ? new Date(savedState.miningStartTime) : null);
        
        // If user was mining but app closed, show a notification
        if (savedState.isMining && savedState.miningProgress > 0 && !savedState.miningStartTime) {
          notifications.handleMiningContinued();
        }
      } else {
        // Reset for new user
        setIsMining(false);
        setMiningProgress(0);
        setTimeUntilNextMining(null);
        setCoinsMinedInSession(0);
        setLastMiningDate(null);
        setTotalCoinsFromMining(0);
        setMiningStartTime(null);
      }
      
      setInitialLoadComplete(true);
    }
  }, [user?.id]);
  
  // Save state whenever it changes
  useEffect(() => {
    if (user && initialLoadComplete) {
      saveMiningState({
        isMining,
        miningProgress,
        lastMiningDate: lastMiningDate?.toISOString() || null,
        miningStartTime: miningStartTime?.toISOString() || null,
        coinsMinedInSession,
        totalCoinsFromMining
      }, user.id);
    }
  }, [
    isMining, 
    miningProgress, 
    lastMiningDate, 
    miningStartTime,
    coinsMinedInSession, 
    totalCoinsFromMining, 
    user?.id,
    initialLoadComplete
  ]);
  
  // Calculate time until mining completes
  const timeUntilMiningCompletes = miningStartTime 
    ? calculateTimeUntilCompletion(miningStartTime.toISOString(), miningProgress) 
    : null;
  
  const startMining = () => {
    if (timeUntilNextMining !== null) {
      notifications.handleCooldownError();
      return;
    }
    
    const now = new Date();
    setIsMining(true);
    setMiningProgress(0);
    setCoinsMinedInSession(0);
    setMiningStartTime(now);
    notifications.handleMiningStart();
  };
  
  const stopMining = () => {
    if (!isMining) return;
    
    setIsMining(false);
    setMiningStartTime(null);
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
    timeUntilMiningCompletes,
    coinsMinedInSession,
    miningRate,
    totalCoinsFromMining,
    resetMiningCooldown,
    miningStartTime
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
