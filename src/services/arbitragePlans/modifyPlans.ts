
import { ArbitragePlan, ArbitragePlanDB } from '@/types/arbitragePlans';
import { collection, doc, updateDoc, addDoc, getDoc, getFirestore, deleteDoc } from 'firebase/firestore';
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
    const newPlan: Omit<ArbitragePlanDB, 'id'> = {
      name: "New Plan",
      price: 100,
      duration: 30,
      daily_earnings: 5,
      mining_speed: "1x",
      total_earnings: 150,
      withdrawal: "daily",
      color: "blue",
      limited: false
    };
    
    // Add to Firestore
    const docRef = await addDoc(plansCollection, newPlan);
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

// Function to delete an arbitrage plan
export const deleteArbitragePlan = async (planId: string): Promise<boolean> => {
  if (!planId) {
    console.error("Cannot delete plan without ID");
    toast.error("योजना हटाने में त्रुटि हुई");
    return false;
  }
  
  try {
    console.log("Deleting plan with ID:", planId);
    const planRef = doc(db, 'arbitrage_plans', planId);
    
    // Get the current plan to validate it exists
    const planDoc = await getDoc(planRef);
    if (!planDoc.exists()) {
      console.error("Plan not found:", planId);
      toast.error("योजना नहीं मिली");
      return false;
    }
    
    // Delete from Firestore
    await deleteDoc(planRef);
    
    // Invalidate cache
    clearPlanCache();
    
    toast.success("योजना सफलतापूर्वक हटा दी गई");
    return true;
  } catch (error) {
    console.error("Error deleting arbitrage plan:", error);
    toast.error("योजना हटाने में त्रुटि हुई");
    return false;
  }
};
