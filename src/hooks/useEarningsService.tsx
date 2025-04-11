
import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { updateUserDailyEarnings } from '@/services/auth/earnings/updateDailyEarnings';

// This hook sets up a background service to update user earnings daily
export const useEarningsService = () => {
  const { user } = useAuth();
  const lastUpdateRef = useRef<Date | null>(null);
  
  useEffect(() => {
    if (!user?.id) return;
    
    // Check if it's time to update user's earnings
    const checkAndUpdateEarnings = async () => {
      const now = new Date();
      
      // If this is the first check or it's been at least 24 hours since last update
      if (!lastUpdateRef.current || (now.getTime() - lastUpdateRef.current.getTime() >= 24 * 60 * 60 * 1000)) {
        console.log('Checking earnings update for user:', user.id);
        
        try {
          const success = await updateUserDailyEarnings(user.id);
          
          if (success) {
            console.log('Earnings updated successfully');
            lastUpdateRef.current = now;
          } else {
            console.log('No earnings update needed');
          }
        } catch (error) {
          console.error('Error updating earnings:', error);
        }
      }
    };
    
    // Check immediately on mount/user change
    checkAndUpdateEarnings();
    
    // Set up interval to check every hour (in case user stays logged in for days)
    const intervalId = setInterval(checkAndUpdateEarnings, 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [user?.id]);
  
  // This hook doesn't need to return anything
};
