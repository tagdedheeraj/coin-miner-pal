
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { calculateMiningRate, MINING_DURATION, saveMiningState } from './utils';

export const useMiningOperations = () => {
  const { user, updateUser } = useAuth();
  const [isMining, setIsMining] = useState(false);
  const [miningProgress, setMiningProgress] = useState(0);
  const [timeUntilNextMining, setTimeUntilNextMining] = useState<number | null>(null);
  const [coinsMinedInSession, setCoinsMinedInSession] = useState(0);
  const [lastMiningDate, setLastMiningDate] = useState<Date | null>(null);
  const [totalCoinsFromMining, setTotalCoinsFromMining] = useState(0);
  
  const miningRate = calculateMiningRate(user);
  
  // Mining progress effect
  useEffect(() => {
    if (!isMining) return;
    
    const interval = setInterval(() => {
      setMiningProgress(prev => {
        const newProgress = prev + (100 / (MINING_DURATION * 60)); // Increment by small amount each minute
        
        if (newProgress >= 100) {
          // Mining completed
          setIsMining(false);
          
          // Calculate coins mined based on mining rate
          const coins = miningRate * MINING_DURATION;
          setCoinsMinedInSession(coins);
          setTotalCoinsFromMining(prevTotal => prevTotal + coins);
          
          // Add coins to user's balance
          if (user) {
            const newCoins = (user.coins || 0) + coins;
            console.log(`Mining completed. Adding ${coins} coins to user. New total: ${newCoins}`);
            updateUser({ coins: newCoins });
          }
          
          // Set cooldown time
          setLastMiningDate(new Date());
          
          toast.success(`Mining completed! You earned ${coins} Infinium coins.`);
          return 0;
        }
        
        // Every hour (when progress increases by 100/24), award coins based on mining rate
        if (Math.floor((newProgress * MINING_DURATION) / 100) > Math.floor((prev * MINING_DURATION) / 100)) {
          toast.success(`You mined ${miningRate} Infinium coins!`);
        }
        
        return newProgress;
      });
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [isMining, user, updateUser, miningRate]);
  
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
