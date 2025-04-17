
import { useState, useEffect } from 'react';
import { HOUR_IN_MS } from '../utils';

export const useMiningCooldown = (lastMiningDate: Date | null) => {
  const [timeUntilNextMining, setTimeUntilNextMining] = useState<number | null>(null);

  useEffect(() => {
    if (!lastMiningDate) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = now.getTime() - lastMiningDate.getTime();
      const cooldownTime = 24 * HOUR_IN_MS; // 24 hours cooldown
      
      if (elapsed >= cooldownTime) {
        setTimeUntilNextMining(null);
        clearInterval(interval);
      } else {
        setTimeUntilNextMining(cooldownTime - elapsed);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [lastMiningDate]);

  return {
    timeUntilNextMining,
    setTimeUntilNextMining,
  };
};
