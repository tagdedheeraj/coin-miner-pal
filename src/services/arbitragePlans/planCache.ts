
import { ArbitragePlan } from '@/types/arbitragePlans';

// Cache for arbitrage plans
let cachedPlans: ArbitragePlan[] = [];
let lastFetchTime = 0;

export const getPlanCache = () => {
  return {
    cachedPlans,
    lastFetchTime
  };
};

export const updatePlanCache = (plans: ArbitragePlan[]) => {
  cachedPlans = plans;
  lastFetchTime = Date.now();
};

export const clearPlanCache = () => {
  cachedPlans = [];
  lastFetchTime = 0;
};

export const isCacheValid = (forceFresh = false): boolean => {
  const currentTime = Date.now();
  const cacheExpired = (currentTime - lastFetchTime) > (1 * 60 * 1000); // 1 minute cache
  
  return !forceFresh && !cacheExpired && cachedPlans.length > 0;
};
