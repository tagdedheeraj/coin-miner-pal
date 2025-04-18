
import { useState, useEffect } from 'react';
import { HOUR_IN_MS } from '../utils';

export const useMiningCooldown = (lastMiningDate: Date | null) => {
  const [timeUntilNextMining, setTimeUntilNextMining] = useState<number | null>(null);

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
    
    // Set initial value
    setTimeUntilNextMining(calculateRemainingCooldown());
    
    // Update every second
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
  }, [lastMiningDate]);

  return {
    timeUntilNextMining,
    setTimeUntilNextMining,
  };
};
