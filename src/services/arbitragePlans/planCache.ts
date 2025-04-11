
import { ArbitragePlan } from '@/types/arbitragePlans';

// Cache for arbitrage plans
let cachedPlans: ArbitragePlan[] = [];
let lastFetchTime = 0;

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export const getPlanCache = () => {
  return {
    cachedPlans,
    lastFetchTime
  };
};

export const updatePlanCache = (plans: ArbitragePlan[]) => {
  console.log("Updating plan cache with", plans.length, "plans");
  cachedPlans = plans;
  lastFetchTime = Date.now();
};

export const clearPlanCache = () => {
  console.log("Clearing plan cache");
  cachedPlans = [];
  lastFetchTime = 0;
};

export const isCacheValid = (forceFresh = false): boolean => {
  const currentTime = Date.now();
  const cacheExpired = (currentTime - lastFetchTime) > CACHE_DURATION;
  
  const isValid = !forceFresh && !cacheExpired && cachedPlans.length > 0;
  console.log("Cache status:", isValid ? "valid" : "invalid", 
    "| Force fresh:", forceFresh, 
    "| Cache expired:", cacheExpired, 
    "| Cache items:", cachedPlans.length);
  
  return isValid;
};
