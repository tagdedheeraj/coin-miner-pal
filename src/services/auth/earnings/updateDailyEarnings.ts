import { User } from '@/types/auth';
import { toast } from 'sonner';
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

// This function will be called to update a user's USDT earnings based on their active plans
export const updateUserDailyEarnings = async (userId: string): Promise<boolean> => {
  try {
    const db = getFirestore();
    
    // Get the user document
    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);
    
    if (!userSnapshot.exists()) {
      console.error('User not found for daily earnings update');
      return false;
    }
    
    const userData = userSnapshot.data();
    const activePlans = userData.active_plans || [];
    const currentUsdtEarnings = userData.usdt_earnings || 0;
    const notifications = userData.notifications || [];
    
    // Get the last earnings update timestamp
    const lastEarningsUpdate = userData.last_earnings_update ? new Date(userData.last_earnings_update) : null;
    
    // Convert current time to IST
    const currentDate = new Date();
    const istOptions = { timeZone: 'Asia/Kolkata' };
    const istDate = new Date(currentDate.toLocaleString('en-US', istOptions));
    
    // Check if we already updated earnings today in IST
    if (lastEarningsUpdate) {
      const lastUpdateDay = new Date(lastEarningsUpdate);
      lastUpdateDay.setHours(0, 0, 0, 0);
      
      const today = new Date(istDate);
      today.setHours(0, 0, 0, 0);
      
      if (lastUpdateDay.getTime() === today.getTime()) {
        console.log(`User ${userId} earnings already updated today (IST)`);
        return false;
      }
    }
    
    if (activePlans.length === 0) {
      // User has no active plans
      return false;
    }
    
    let totalDailyEarnings = 0;
    const updatedActivePlans = [];
    
    // Check each plan if it's still active and calculate earnings
    for (const plan of activePlans) {
      const expiryDate = new Date(plan.expiryDate);
      
      if (currentDate <= expiryDate) {
        // Plan is still active
        totalDailyEarnings += plan.dailyEarnings;
        updatedActivePlans.push(plan);
      }
    }
    
    // Update user's USDT earnings and send notification
    if (totalDailyEarnings > 0) {
      const newUsdtEarnings = currentUsdtEarnings + totalDailyEarnings;
      
      await updateDoc(userRef, {
        usdt_earnings: newUsdtEarnings,
        active_plans: updatedActivePlans,
        last_earnings_update: istDate.toISOString(),
        notifications: [
          ...notifications,
          {
            id: uuidv4(),
            message: `You earned $${totalDailyEarnings.toFixed(2)} USDT from your arbitrage plans today!`,
            read: false,
            createdAt: new Date().toISOString()
          }
        ]
      });
      
      console.log(`Updated user ${userId} earnings by +$${totalDailyEarnings}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating daily earnings:', error);
    return false;
  }
};

// Function to update earnings for all users (to be called by cron job or admin)
export const updateAllUsersDailyEarnings = async (): Promise<{ success: number, failed: number }> => {
  try {
    const db = getFirestore();
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    let successCount = 0;
    let failedCount = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const success = await updateUserDailyEarnings(userDoc.id);
      if (success) {
        successCount++;
      } else {
        failedCount++;
      }
    }
    
    return { success: successCount, failed: failedCount };
  } catch (error) {
    console.error('Error in batch updating daily earnings:', error);
    return { success: 0, failed: 0 };
  }
};
