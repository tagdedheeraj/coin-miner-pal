
import { collection, onSnapshot, getFirestore } from 'firebase/firestore';
import { toast } from 'sonner';

// Initialize Firestore
const db = getFirestore();
const plansCollection = collection(db, 'arbitrage_plans');

/**
 * Subscribe to changes in arbitrage plans collection
 * Returns an unsubscribe function to stop listening for changes
 */
export const subscribeToPlanChanges = (onPlansChange: () => void) => {
  console.log("Setting up subscription to arbitrage plans changes");
  
  try {
    // Listen for real-time updates
    const unsubscribe = onSnapshot(plansCollection, (snapshot) => {
      console.log("Received plan update from Firestore");
      
      // Call the callback function to notify about changes
      onPlansChange();
    }, (error) => {
      console.error("Error in plan subscription:", error);
      toast.error("योजनाओं की सदस्यता में त्रुटि हुई");
    });
    
    // Return an object with unsubscribe method
    return {
      unsubscribe: () => {
        console.log("Unsubscribing from plan changes");
        unsubscribe();
      }
    };
  } catch (error) {
    console.error("Error setting up plan subscription:", error);
    toast.error("योजनाओं की सदस्यता में त्रुटि हुई");
    
    // Return a dummy unsubscribe function in case of error
    return {
      unsubscribe: () => console.log("No active subscription to unsubscribe")
    };
  }
};
