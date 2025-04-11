
import { ArbitragePlan, ArbitragePlanDB } from '@/types/arbitragePlans';
import { toast } from 'sonner';
import { collection, getDocs, doc, updateDoc, addDoc, onSnapshot, getFirestore, getDoc } from 'firebase/firestore';

// Initialize Firestore
const db = getFirestore();
const plansCollection = collection(db, 'arbitrage_plans');

// Map DB fields to UI model
const mapDbToPlan = (id: string, data: any): ArbitragePlan => {
  return {
    id,
    name: data.name || '',
    price: data.price || 0,
    duration: data.duration || 0,
    dailyEarnings: data.daily_earnings || 0,
    miningSpeed: data.mining_speed || '',
    totalEarnings: data.total_earnings || 0,
    withdrawal: data.withdrawal || '',
    color: data.color || 'blue',
    limited: data.limited || false,
    limitedTo: data.limited_to
  };
};

// Map UI model to DB fields
const mapPlanToDb = (plan: ArbitragePlan): Partial<ArbitragePlanDB> => {
  return {
    name: plan.name,
    price: plan.price,
    duration: plan.duration,
    daily_earnings: plan.dailyEarnings,
    mining_speed: plan.miningSpeed,
    total_earnings: plan.totalEarnings,
    withdrawal: plan.withdrawal,
    color: plan.color,
    limited: plan.limited,
    limited_to: plan.limitedTo
  };
};

let cachedPlans: ArbitragePlan[] = [];
let lastFetchTime = 0;

// Function to fetch all arbitrage plans
export const fetchArbitragePlans = async (forceFresh = false): Promise<ArbitragePlan[]> => {
  const currentTime = Date.now();
  const cacheExpired = (currentTime - lastFetchTime) > (1 * 60 * 1000); // 1 minute cache (reduced from 5)
  
  if (!forceFresh && !cacheExpired && cachedPlans.length > 0) {
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
    cachedPlans = plans;
    lastFetchTime = currentTime;
    
    console.log("Fetched plans:", plans);
    return plans;
  } catch (error) {
    console.error("Error fetching arbitrage plans:", error);
    toast.error("योजनाओं को लोड करने में त्रुटि हुई");
    return [];
  }
};

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
    lastFetchTime = 0;
    cachedPlans = [];
    
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
    lastFetchTime = 0;
    cachedPlans = [];
    
    toast.success("नई योजना बनाई गई");
    return true;
  } catch (error) {
    console.error("Error creating new arbitrage plan:", error);
    toast.error("नई योजना बनाने में त्रुटि हुई");
    return false;
  }
};

// Function to subscribe to plan changes
export const subscribeToPlanChanges = (callback: () => void) => {
  const unsubscribe = onSnapshot(plansCollection, (snapshot) => {
    console.log("Plan changes detected");
    
    // Clear cache to force a refresh
    lastFetchTime = 0;
    cachedPlans = [];
    
    // Call the callback
    callback();
  }, (error) => {
    console.error("Error in plan subscription:", error);
  });
  
  return {
    unsubscribe
  };
};

// Function to get a specific plan by ID
export const getArbitragePlanById = async (planId: string): Promise<ArbitragePlan | null> => {
  try {
    // Check cache first
    const cachedPlan = cachedPlans.find(p => p.id === planId);
    if (cachedPlan) {
      return cachedPlan;
    }
    
    // Fetch from Firestore
    const planRef = doc(db, 'arbitrage_plans', planId);
    const planDoc = await getDoc(planRef);
    
    if (!planDoc.exists()) {
      console.error("Plan not found:", planId);
      return null;
    }
    
    return mapDbToPlan(planDoc.id, planDoc.data());
  } catch (error) {
    console.error("Error fetching plan by ID:", error);
    return null;
  }
};
