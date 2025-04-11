
import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { updateUserDailyEarnings } from './updateDailyEarnings';

// Time interval for earnings update check (24 hours in milliseconds)
const EARNINGS_UPDATE_INTERVAL = 24 * 60 * 60 * 1000;

export const useEarningsService = () => {
  const { user } = useAuth();
  const lastUpdateRef = useRef<Date | null>(null);
  
  useEffect(() => {
    if (!user) return;
    
    // Function to check if earnings should be updated
    const checkEarningsUpdate = async () => {
      const now = new Date();
      
      // If this is the first check or it's been 24 hours since the last update
      if (
        !lastUpdateRef.current || 
        (now.getTime() - lastUpdateRef.current.getTime() >= EARNINGS_UPDATE_INTERVAL)
      ) {
        console.log('Checking for earnings update...');
        
        // Update earnings
        const success = await updateUserDailyEarnings(user.id);
        
        if (success) {
          console.log('User earnings updated successfully');
          // Update the last update timestamp
          lastUpdateRef.current = now;
        }
      }
    };
    
    // Check immediately when the component mounts
    checkEarningsUpdate();
    
    // Then set an interval for future checks (every hour)
    const intervalId = setInterval(() => {
      checkEarningsUpdate();
    }, 60 * 60 * 1000); // Check every hour
    
    return () => {
      clearInterval(intervalId);
    };
  }, [user]);
  
  // No need to return anything, this hook just sets up the background service
};
