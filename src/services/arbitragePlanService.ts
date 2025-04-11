
import { supabase } from '@/integrations/supabase/client';
import { ArbitragePlan, ArbitragePlanDB } from '@/types/arbitragePlans';
import { toast } from 'sonner';

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

// Helper function to retry a failed request
const retryOperation = async (operation: () => Promise<any>, retries = 3, delay = 1000): Promise<any> => {
  try {
    return await operation();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryOperation(operation, retries - 1, delay * 1.5);
  }
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
    
    // Retry mechanism with a timeout
    const { data, error } = await retryOperation(async () => {
      return await supabase
        .from('arbitrage_plans')
        .select('*')
        .order('price', { ascending: true });
    });
    
    if (error) {
      console.error('Error fetching plans:', error);
      toast.error('योजनाओं को लोड करने में विफल');
      return plansCache || []; // Return cached data if available, even if expired
    }
    
    if (data) {
      console.log('Received fresh plans data:', data);
      const plans = data.map((plan: any) => mapDbToPlan(plan));
      // Update the cache
      plansCache = plans;
      lastFetchTime = now;
      return plans;
    }
    
    return plansCache || [];
  } catch (error) {
    console.error('Error fetching plans:', error);
    return plansCache || []; // Return cached data if available, even if expired
  }
};

export const updateArbitragePlan = async (plan: ArbitragePlan): Promise<boolean> => {
  try {
    console.log('Updating arbitrage plan:', plan);
    const dbPlan = mapPlanToDb(plan);
    
    // Retry mechanism
    const { error } = await retryOperation(async () => {
      return await supabase
        .from('arbitrage_plans')
        .update(dbPlan)
        .eq('id', plan.id);
    });
    
    if (error) {
      console.error('Error updating plan:', error);
      toast.error('योजना अपडेट करने में विफल');
      return false;
    }
    
    // Invalidate cache immediately
    plansCache = null;
    lastFetchTime = 0;
    
    // Fetch the updated plans immediately
    await fetchArbitragePlans(true);
    
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
    name: 'New Plan',
    price: 50,
    duration: 30,
    daily_earnings: 2,
    mining_speed: '1.5x',
    total_earnings: 60,
    withdrawal: 'Daily',
    color: 'blue',
    limited: false
  };
  
  try {
    console.log('Creating new arbitrage plan');
    
    // Retry mechanism
    const { data, error } = await retryOperation(async () => {
      return await supabase
        .from('arbitrage_plans')
        .insert(newPlan)
        .select();
    });
    
    if (error) {
      console.error('Error creating plan:', error);
      toast.error('नई योजना बनाने में विफल');
      return false;
    }
    
    if (data && data[0]) {
      // Invalidate cache
      plansCache = null;
      lastFetchTime = 0;
      
      // Fetch the updated plans
      await fetchArbitragePlans(true);
      
      console.log('New plan created successfully');
      toast.success('नई योजना बनाई गई');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error creating plan:', error);
    toast.error('नई योजना बनाने में विफल');
    return false;
  }
};

export const subscribeToPlanChanges = (callback: () => void) => {
  console.log('Setting up subscription to plan changes');
  
  // Subscribe to changes
  const subscription = supabase
    .channel('arbitrage_plans_changes')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'arbitrage_plans' 
    }, (payload) => {
      console.log('Plan change detected:', payload);
      // Invalidate cache when changes are detected
      plansCache = null;
      lastFetchTime = 0;
      callback();
    })
    .subscribe();
  
  return subscription;
};
