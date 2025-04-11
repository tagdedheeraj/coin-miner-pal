
import { collection, onSnapshot, getFirestore } from 'firebase/firestore';
import { clearPlanCache } from './planCache';

// Initialize Firestore
const db = getFirestore();
const plansCollection = collection(db, 'arbitrage_plans');

// Function to subscribe to plan changes
export const subscribeToPlanChanges = (callback: () => void) => {
  const unsubscribe = onSnapshot(plansCollection, (snapshot) => {
    console.log("Plan changes detected");
    
    // Clear cache to force a refresh
    clearPlanCache();
    
    // Call the callback
    callback();
  }, (error) => {
    console.error("Error in plan subscription:", error);
  });
  
  return {
    unsubscribe
  };
};
