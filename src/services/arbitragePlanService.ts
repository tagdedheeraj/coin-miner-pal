
import { ArbitragePlan, ArbitragePlanDB } from '@/types/arbitragePlans';
import { toast } from 'sonner';
import { mockArbitragePlans } from '@/data/mockArbitragePlans';

// Performance optimization: Add caching for plans
let plansCache: ArbitragePlan[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 seconds cache (reduced from 60 seconds)

// Map the database columns to our frontend model
export const mapDbToPlan = (dbPlan: Record<string, any>): ArbitragePlan => {
  return {
    id: dbPlan.id,
    name: dbPlan.name,
    price: dbPlan.price,
    duration: dbPlan.duration,
    dailyEarnings: dbPlan.daily_earnings,
    miningSpeed: dbPlan.mining_speed,
    totalEarnings: dbPlan.total_earnings,
    withdrawal: dbPlan.withdrawal,
    color: dbPlan.color || 'blue',
    limited: dbPlan.limited || false,
    limitedTo: dbPlan.limited_to
  };
};

// Map the frontend model to database columns
export const mapPlanToDb = (plan: ArbitragePlan): ArbitragePlanDB => {
  return {
    id: plan.id,
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

// Helper function to simulate async operations
const simulateAsyncOperation = async <T>(data: T): Promise<T> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return data;
};

export const fetchArbitragePlans = async (forceFresh = false): Promise<ArbitragePlan[]> => {
  try {
    const now = Date.now();
    
    // Return cached data if available and not expired, unless forceFresh is true
    if (!forceFresh && plansCache && (now - lastFetchTime < CACHE_DURATION)) {
      console.log('Using cached plans data');
      return plansCache;
    }
    
    console.log(forceFresh ? 'Forced refresh of plans data' : 'Cache expired, fetching fresh plans data');
    
    // Use mock data since we can't access the actual table
    const plans = await simulateAsyncOperation(mockArbitragePlans);
    
    console.log('Received fresh plans data:', plans);
    
    // Update the cache
    plansCache = plans;
    lastFetchTime = now;
    return plans;
  } catch (error) {
    console.error('Error fetching plans:', error);
    toast.error('योजनाओं को लोड करने में विफल');
    return plansCache || []; // Return cached data if available, even if expired
  }
};

export const updateArbitragePlan = async (plan: ArbitragePlan): Promise<boolean> => {
  try {
    console.log('Updating arbitrage plan:', plan);
    
    // Update in the local cache
    if (plansCache) {
      plansCache = plansCache.map(p => p.id === plan.id ? plan : p);
    }
    
    // Simulate successful operation
    await simulateAsyncOperation(true);
    
    console.log('Plan updated successfully');
    toast.success('योजना सफलतापूर्वक अपडेट की गई');
    return true;
  } catch (error) {
    console.error('Error saving plan:', error);
    toast.error('योजना परिवर्तन सहेजने में विफल');
    return false;
  }
};

export const createArbitragePlan = async (): Promise<boolean> => {
  // Create a new plan with default values
  const newPlan = {
    id: `plan-${Date.now()}`,
    name: 'New Plan',
    price: 50,
    duration: 30,
    dailyEarnings: 2,
    miningSpeed: '1.5x',
    totalEarnings: 60,
    withdrawal: 'Daily',
    color: 'blue',
    limited: false
  };
  
  try {
    console.log('Creating new arbitrage plan');
    
    // Add to the local cache
    if (plansCache) {
      plansCache = [...plansCache, newPlan];
    }
    
    // Simulate successful operation
    await simulateAsyncOperation(true);
    
    console.log('New plan created successfully');
    toast.success('नई योजना बनाई गई');
    return true;
  } catch (error) {
    console.error('Error creating plan:', error);
    toast.error('नई योजना बनाने में विफल');
    return false;
  }
};

export const subscribeToPlanChanges = (callback: () => void) => {
  console.log('Setting up mock subscription to plan changes');
  
  // No real subscription needed when using mock data
  // Return a dummy object with an unsubscribe method
  return {
    unsubscribe: () => {
      console.log('Unsubscribing from mock plan changes');
    }
  };
};
