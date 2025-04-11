
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface MiningContextType {
  isMining: boolean;
  startMining: () => void;
  stopMining: () => void;
  miningProgress: number;
  timeUntilNextMining: number | null;
  coinsMinedInSession: number;
  miningRate: number;
  totalCoinsFromMining: number;
  resetMiningCooldown: () => void;
}

const MiningContext = createContext<MiningContextType | undefined>(undefined);

export const MiningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateUser } = useAuth();
  const [isMining, setIsMining] = useState(false);
  const [miningProgress, setMiningProgress] = useState(0);
  const [timeUntilNextMining, setTimeUntilNextMining] = useState<number | null>(null);
  const [coinsMinedInSession, setCoinsMinedInSession] = useState(0);
  const [lastMiningDate, setLastMiningDate] = useState<Date | null>(null);
  const [totalCoinsFromMining, setTotalCoinsFromMining] = useState(0);
  
  const miningRate = 2; // 2 coins per hour
  const miningDuration = 24; // 24 hours
  const hourInMs = 3600000; // 1 hour in milliseconds
  
  // Load saved mining state on mount
  useEffect(() => {
    const savedState = localStorage.getItem('miningState');
    if (savedState && user) {
      try {
        const { 
          isMining: savedIsMining, 
          miningProgress: savedProgress, 
          lastMiningDate: savedLastMiningDate,
          coinsMinedInSession: savedCoinsMinedInSession,
          totalCoinsFromMining: savedTotalCoinsFromMining,
          userId
        } = JSON.parse(savedState);
        
        // Only restore state if it belongs to the current user
        if (userId === user.id) {
          setIsMining(savedIsMining);
          setMiningProgress(savedProgress);
          setLastMiningDate(savedLastMiningDate ? new Date(savedLastMiningDate) : null);
          setCoinsMinedInSession(savedCoinsMinedInSession || 0);
          setTotalCoinsFromMining(savedTotalCoinsFromMining || 0);
        } else {
          // Reset for new user
          resetMiningState();
        }
      } catch (error) {
        console.error('Failed to parse saved mining state', error);
        resetMiningState();
      }
    } else {
      // Reset for new user
      resetMiningState();
    }
  }, [user?.id]);
  
  // Reset mining state for new users
  const resetMiningState = () => {
    setIsMining(false);
    setMiningProgress(0);
    setTimeUntilNextMining(null);
    setCoinsMinedInSession(0);
    setLastMiningDate(null);
    setTotalCoinsFromMining(0);
  };
  
  // Save mining state when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('miningState', JSON.stringify({
        isMining,
        miningProgress,
        lastMiningDate: lastMiningDate?.toISOString(),
        coinsMinedInSession,
        totalCoinsFromMining,
        userId: user.id
      }));
    }
  }, [isMining, miningProgress, lastMiningDate, coinsMinedInSession, totalCoinsFromMining, user?.id]);
  
  // Mining progress effect
  useEffect(() => {
    if (!isMining) return;
    
    const interval = setInterval(() => {
      setMiningProgress(prev => {
        const newProgress = prev + (100 / (miningDuration * 60)); // Increment by small amount each minute
        
        if (newProgress >= 100) {
          // Mining completed
          setIsMining(false);
          
          // Calculate coins mined
          const coins = miningRate * miningDuration;
          setCoinsMinedInSession(coins);
          setTotalCoinsFromMining(prevTotal => prevTotal + coins);
          
          // Add coins to user's balance
          if (user) {
            updateUser({ coins: (user.coins || 0) + coins });
          }
          
          // Set cooldown time
          setLastMiningDate(new Date());
          
          toast.success(`माइनिंग पूरी हुई! आपने ${coins} Infinium सिक्के कमाए.`);
          return 0;
        }
        
        // Every hour (when progress increases by 100/24), award coins
        if (Math.floor((newProgress * miningDuration) / 100) > Math.floor((prev * miningDuration) / 100)) {
          // Every hour milestone reached
          toast.success(`आपने ${miningRate} Infinium सिक्के माइन किए!`);
        }
        
        return newProgress;
      });
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [isMining, user, updateUser, miningRate, miningDuration]);
  
  // Cooldown timer effect
  useEffect(() => {
    if (!lastMiningDate) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = now.getTime() - lastMiningDate.getTime();
      const cooldownTime = 24 * hourInMs; // 24 hours cooldown
      
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
      toast.error('माइनिंग कूलडाउन पर है। कृपया कूलडाउन समाप्त होने तक प्रतीक्षा करें।');
      return;
    }
    
    setIsMining(true);
    setMiningProgress(0);
    setCoinsMinedInSession(0);
    toast.success('माइनिंग शुरू हुई!');
  };
  
  const stopMining = () => {
    if (!isMining) return;
    
    setIsMining(false);
    toast.info('माइनिंग रुक गई।');
  };
  
  const resetMiningCooldown = () => {
    // This would normally require admin privileges or be a paid feature
    setLastMiningDate(null);
    setTimeUntilNextMining(null);
    toast.success('माइनिंग कूलडाउन रीसेट किया गया!');
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
