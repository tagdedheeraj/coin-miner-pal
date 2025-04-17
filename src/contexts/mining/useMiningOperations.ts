import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { calculateMiningRate, MINING_DURATION, saveMiningState } from './utils';
import { useMiningNotifications } from '@/components/mining/MiningNotifications';

export const useMiningOperations = () => {
  const { user, updateUser } = useAuth();
  const [isMining, setIsMining] = useState(false);
  const [miningProgress, setMiningProgress] = useState(0);
  const [timeUntilNextMining, setTimeUntilNextMining] = useState<number | null>(null);
  const [coinsMinedInSession, setCoinsMinedInSession] = useState(0);
  const [lastMiningDate, setLastMiningDate] = useState<Date | null>(null);
  const [totalCoinsFromMining, setTotalCoinsFromMining] = useState(0);
  
  const miningRate = calculateMiningRate(user);
  
  const notifications = useMiningNotifications({
    isMining,
    miningProgress,
    miningRate,
    coinsMinedInSession
  });

  // Mining progress effect
  useEffect(() => {
    if (!isMining) return;
    
    const interval = setInterval(() => {
      setMiningProgress(prev => {
        const newProgress = prev + (100 / (MINING_DURATION * 60));
        
        if (newProgress >= 100) {
          setIsMining(false);
          const coins = miningRate * MINING_DURATION;
          setCoinsMinedInSession(coins);
          setTotalCoinsFromMining(prevTotal => prevTotal + coins);
          
          if (user) {
            const newCoins = (user.coins || 0) + coins;
            console.log(`Mining completed. Adding ${coins} coins to user. New total: ${newCoins}`);
            updateUser({ coins: newCoins });
          }
          
          setLastMiningDate(new Date());
          notifications.handleMiningComplete(coins);
          return 0;
        }
        
        if (Math.floor((newProgress * MINING_DURATION) / 100) > Math.floor((prev * MINING_DURATION) / 100)) {
          notifications.handleHourlyReward();
        }
        
        return newProgress;
      });
    }, 60000);
    
    return () => clearInterval(interval);
  }, [isMining, user, updateUser, miningRate, notifications]);
  
  // Save state whenever it changes
  useEffect(() => {
    if (user) {
      saveMiningState({
        isMining,
        miningProgress,
        lastMiningDate: lastMiningDate?.toISOString(),
        coinsMinedInSession,
        totalCoinsFromMining,
      }, user.id);
    }
  }, [isMining, miningProgress, lastMiningDate, coinsMinedInSession, totalCoinsFromMining, user?.id]);
  
  return {
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
  };
};
