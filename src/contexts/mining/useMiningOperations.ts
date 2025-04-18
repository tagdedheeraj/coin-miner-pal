
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { calculateMiningRate, MINING_DURATION, HOUR_IN_MS, saveMiningState } from './utils';
import { useMiningNotifications } from '@/components/mining/MiningNotifications';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

export const useMiningOperations = () => {
  const { user, updateUser } = useAuth();
  const [isMining, setIsMining] = useState(false);
  const [miningProgress, setMiningProgress] = useState(0);
  const [timeUntilNextMining, setTimeUntilNextMining] = useState<number | null>(null);
  const [coinsMinedInSession, setCoinsMinedInSession] = useState(0);
  const [lastMiningDate, setLastMiningDate] = useState<Date | null>(null);
  const [totalCoinsFromMining, setTotalCoinsFromMining] = useState(0);
  const [miningStartTime, setMiningStartTime] = useState<Date | null>(null);
  
  const miningRate = calculateMiningRate(user);
  
  const notifications = useMiningNotifications({
    isMining,
    miningProgress,
    miningRate,
    coinsMinedInSession
  });

  // Mining progress effect
  useEffect(() => {
    if (!isMining || !miningStartTime) return;
    
    // Calculate initial progress based on start time
    const calculateInitialProgress = () => {
      const now = new Date();
      const elapsedMs = now.getTime() - miningStartTime.getTime();
      const elapsedHours = elapsedMs / HOUR_IN_MS;
      return Math.min((elapsedHours / MINING_DURATION) * 100, 99.9);
    };
    
    // Set initial progress
    if (miningProgress === 0) {
      const initialProgress = calculateInitialProgress();
      if (initialProgress > 0) {
        setMiningProgress(initialProgress);
      }
    }
    
    const interval = setInterval(() => {
      const now = new Date();
      const elapsedMs = now.getTime() - miningStartTime.getTime();
      const elapsedHours = elapsedMs / HOUR_IN_MS;
      const newProgress = Math.min((elapsedHours / MINING_DURATION) * 100, 100);
      
      setMiningProgress(newProgress);
      
      if (newProgress >= 100) {
        setIsMining(false);
        setMiningStartTime(null);
        const coins = miningRate * MINING_DURATION;
        setCoinsMinedInSession(coins);
        setTotalCoinsFromMining(prevTotal => prevTotal + coins);
        
        if (user) {
          const newCoins = (user.coins || 0) + coins;
          console.log(`Mining completed. Adding ${coins} coins to user. New total: ${newCoins}`);
          updateUser({ coins: newCoins });
          
          // Update mining state in Firebase
          const db = getFirestore();
          const miningStateRef = doc(db, 'mining_states', user.id);
          
          updateDoc(miningStateRef, {
            isMining: false,
            miningProgress: 100,
            miningStartTime: null,
            lastMiningDate: new Date().toISOString(),
            coinsMinedInSession: coins,
            totalCoinsFromMining: (totalCoinsFromMining || 0) + coins,
            updatedAt: new Date().toISOString(),
          }).catch(error => {
            console.error("Error updating mining state after completion:", error);
          });
        }
        
        setLastMiningDate(new Date());
        notifications.handleMiningComplete(coins);
        clearInterval(interval);
        return;
      }
      
      // Hourly rewards notification
      const prevHours = Math.floor(((newProgress - (100 / (MINING_DURATION * 60))) * MINING_DURATION) / 100);
      const currHours = Math.floor((newProgress * MINING_DURATION) / 100);
      
      if (currHours > prevHours) {
        notifications.handleHourlyReward();
        
        // Add hourly reward to user's coins
        if (user) {
          const hourlyReward = miningRate;
          const newCoins = (user.coins || 0) + hourlyReward;
          console.log(`Hourly reward. Adding ${hourlyReward} coins to user. New total: ${newCoins}`);
          updateUser({ coins: newCoins });
        }
      }
      
      // Update mining progress in Firebase every 5 minutes
      if (user && newProgress % 5 === 0) {
        const db = getFirestore();
        const miningStateRef = doc(db, 'mining_states', user.id);
        
        updateDoc(miningStateRef, {
          miningProgress: newProgress,
          updatedAt: new Date().toISOString(),
        }).catch(error => {
          console.error("Error updating mining progress in Firebase:", error);
        });
      }
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [isMining, user, updateUser, miningRate, notifications, miningStartTime, miningProgress, totalCoinsFromMining]);
  
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
    miningRate,
    miningStartTime,
    setMiningStartTime
  };
};
