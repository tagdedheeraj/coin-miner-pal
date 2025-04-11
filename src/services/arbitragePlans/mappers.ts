
import { ArbitragePlan, ArbitragePlanDB } from '@/types/arbitragePlans';

/**
 * Maps a Firestore document to an ArbitragePlan model
 */
export const mapDbToPlan = (id: string, data: any): ArbitragePlan => {
  return {
    id,
    name: data.name || '',
    price: data.price || 0,
    duration: data.duration || 0,
    dailyEarnings: data.daily_earnings || 0,
    miningSpeed: data.mining_speed || '1x',
    totalEarnings: data.total_earnings || 0,
    withdrawal: data.withdrawal || 'daily',
    color: data.color || 'blue',
    limited: data.limited || false,
    limitedTo: data.limited_to
  };
};

/**
 * Maps an ArbitragePlan model to a format suitable for Firestore
 */
export const mapPlanToDb = (plan: Partial<ArbitragePlan>): Partial<ArbitragePlanDB> => {
  const dbPlan: Partial<ArbitragePlanDB> = {
    name: plan.name,
    price: plan.price,
    duration: plan.duration,
    daily_earnings: plan.dailyEarnings,
    mining_speed: plan.miningSpeed,
    total_earnings: plan.totalEarnings,
    withdrawal: plan.withdrawal,
    color: plan.color,
    limited: plan.limited
  };
  
  // Only add limited_to if plan is limited
  if (plan.limited && plan.limitedTo) {
    dbPlan.limited_to = plan.limitedTo;
  }
  
  return dbPlan;
};
