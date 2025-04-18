
import { useState, useEffect } from 'react';
import { HOUR_IN_MS } from '../utils';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';

export const useMiningCooldown = (lastMiningDate: Date | null) => {
  const [timeUntilNextMining, setTimeUntilNextMining] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!lastMiningDate) {
      setTimeUntilNextMining(null);
      return;
    }
    
    // Calculate initial cooldown time
    const calculateRemainingCooldown = () => {
      const now = new Date();
      const elapsed = now.getTime() - lastMiningDate.getTime();
      const cooldownTime = 24 * HOUR_IN_MS; // 24 hours cooldown
      
      if (elapsed >= cooldownTime) {
        return null; // Cooldown complete
      } else {
        return cooldownTime - elapsed; // Time remaining
      }
    };
    
    // Check Firebase first for the latest cooldown
    const checkServerCooldown = async () => {
      if (!user?.id) return;
      
      try {
        const db = getFirestore();
        const miningStateRef = doc(db, 'mining_states', user.id);
        const docSnap = await getDoc(miningStateRef);
        
        if (docSnap.exists() && docSnap.data().lastMiningDate) {
          const serverLastMiningDate = new Date(docSnap.data().lastMiningDate);
          const now = new Date();
          const elapsed = now.getTime() - serverLastMiningDate.getTime();
          const cooldownTime = 24 * HOUR_IN_MS; // 24 hours cooldown
          
          if (elapsed >= cooldownTime) {
            setTimeUntilNextMining(null); // Cooldown complete
          } else {
            setTimeUntilNextMining(cooldownTime - elapsed); // Time remaining
          }
        } else {
          // Fall back to local calculation
          setTimeUntilNextMining(calculateRemainingCooldown());
        }
      } catch (error) {
        console.error("Error checking server cooldown:", error);
        // Fall back to local calculation
        setTimeUntilNextMining(calculateRemainingCooldown());
      }
    };
    
    // Check server cooldown first
    checkServerCooldown();
    
    // Then update every second
    const interval = setInterval(() => {
      const remaining = calculateRemainingCooldown();
      
      if (remaining === null) {
        setTimeUntilNextMining(null);
        clearInterval(interval);
      } else {
        setTimeUntilNextMining(remaining);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [lastMiningDate, user?.id]);

  return {
    timeUntilNextMining,
    setTimeUntilNextMining,
  };
};
