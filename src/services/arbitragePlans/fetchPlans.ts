
import { ArbitragePlan } from '@/types/arbitragePlans';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { toast } from 'sonner';
import { mapDbToPlan } from './mappers';
import { getPlanCache, updatePlanCache, isCacheValid } from './planCache';

// Initialize Firestore
const db = getFirestore();
const plansCollection = collection(db, 'arbitrage_plans');

// Function to fetch all arbitrage plans
export const fetchArbitragePlans = async (forceFresh = false): Promise<ArbitragePlan[]> => {
  if (isCacheValid(forceFresh)) {
    const { cachedPlans } = getPlanCache();
    console.log("Returning cached plans", cachedPlans);
    return cachedPlans;
  }
  
  try {
    console.log("Fetching fresh arbitrage plans from Firestore");
    const snapshot = await getDocs(plansCollection);
    
    if (snapshot.empty) {
      console.log("No plans found in Firestore");
      return [];
    }
    
    const plans: ArbitragePlan[] = [];
    snapshot.forEach(doc => {
      const plan = mapDbToPlan(doc.id, doc.data());
      plans.push(plan);
    });
    
    // Update cache
    updatePlanCache(plans);
    
    console.log("Fetched plans:", plans);
    return plans;
  } catch (error) {
    console.error("Error fetching arbitrage plans:", error);
    toast.error("योजनाओं को लोड करने में त्रुटि हुई");
    return [];
  }
};

// Function to get a specific plan by ID
export const getArbitragePlanById = async (planId: string): Promise<ArbitragePlan | null> => {
  try {
    // Check cache first
    const { cachedPlans } = getPlanCache();
    const cachedPlan = cachedPlans.find(p => p.id === planId);
    if (cachedPlan) {
      return cachedPlan;
    }
    
    // Fetch from Firestore if not in cache
    const plansCollection = collection(db, 'arbitrage_plans');
    const snapshot = await getDocs(plansCollection);
    
    if (snapshot.empty) {
      return null;
    }
    
    let foundPlan: ArbitragePlan | null = null;
    snapshot.forEach(doc => {
      if (doc.id === planId) {
        foundPlan = mapDbToPlan(doc.id, doc.data());
      }
    });
    
    return foundPlan;
  } catch (error) {
    console.error("Error fetching plan by ID:", error);
    return null;
  }
};
