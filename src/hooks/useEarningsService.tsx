
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
      
      // Get today's date at 00:00:00 to check if update happened today
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      
      // If this is the first check or last update was before today
      if (!lastUpdateRef.current || lastUpdateRef.current < today) {
        console.log('Checking earnings update for user:', user.id);
        
        try {
          const success = await updateUserDailyEarnings(user.id);
          
          if (success) {
            console.log('Earnings updated successfully for today');
            lastUpdateRef.current = now;
          } else {
            console.log('No earnings update needed');
          }
        } catch (error) {
          console.error('Error updating earnings:', error);
        }
      } else {
        console.log('Earnings already updated today, skipping');
      }
    };
    
    // Check immediately on mount/user change
    checkAndUpdateEarnings();
    
    // Set up interval to check every 4 hours instead of every hour
    // This is just a safety net in case the app stays open for multiple days
    const intervalId = setInterval(checkAndUpdateEarnings, 4 * 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [user?.id]);
  
  // This hook doesn't need to return anything
};
