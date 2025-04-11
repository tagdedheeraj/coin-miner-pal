
import { ArbitragePlan, ArbitragePlanDB } from '@/types/arbitragePlans';
import { collection, doc, updateDoc, addDoc, getDoc, getFirestore } from 'firebase/firestore';
import { toast } from 'sonner';
import { mapPlanToDb } from './mappers';
import { clearPlanCache } from './planCache';

// Initialize Firestore
const db = getFirestore();
const plansCollection = collection(db, 'arbitrage_plans');

// Function to update an arbitrage plan
export const updateArbitragePlan = async (plan: ArbitragePlan): Promise<boolean> => {
  if (!plan.id) {
    console.error("Cannot update plan without ID");
    toast.error("योजना अपडेट करने में त्रुटि हुई");
    return false;
  }
  
  try {
    console.log("Updating plan:", plan);
    const planRef = doc(db, 'arbitrage_plans', plan.id);
    
    // Get the current plan to validate it exists
    const planDoc = await getDoc(planRef);
    if (!planDoc.exists()) {
      console.error("Plan not found:", plan.id);
      toast.error("योजना नहीं मिली");
      return false;
    }
    
    // Map UI model to DB fields
    const planData = mapPlanToDb(plan);
    
    // Update in Firestore
    await updateDoc(planRef, planData);
    
    // Invalidate cache to force refresh on next fetch
    clearPlanCache();
    
    toast.success("योजना सफलतापूर्वक अपडेट की गई");
    return true;
  } catch (error) {
    console.error("Error updating arbitrage plan:", error);
    toast.error("योजना अपडेट करने में त्रुटि हुई");
    return false;
  }
};

// Function to create a new arbitrage plan
export const createArbitragePlan = async (): Promise<boolean> => {
  try {
    // Create a basic plan template
    const newPlan: Omit<ArbitragePlan, 'id'> = {
      name: "New Plan",
      price: 100,
      duration: 30,
      dailyEarnings: 5,
      miningSpeed: "1x",
      totalEarnings: 150,
      withdrawal: "daily",
      color: "blue",
      limited: false
    };
    
    // Map to DB format
    const planData = mapPlanToDb(newPlan as ArbitragePlan);
    
    // Add to Firestore
    const docRef = await addDoc(plansCollection, planData);
    console.log("Created new plan with ID:", docRef.id);
    
    // Invalidate cache
    clearPlanCache();
    
    toast.success("नई योजना बनाई गई");
    return true;
  } catch (error) {
    console.error("Error creating new arbitrage plan:", error);
    toast.error("नई योजना बनाने में त्रुटि हुई");
    return false;
  }
};
