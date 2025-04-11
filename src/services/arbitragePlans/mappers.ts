
import { ArbitragePlan, ArbitragePlanDB } from '@/types/arbitragePlans';

// Map DB fields to UI model
export const mapDbToPlan = (id: string, data: any): ArbitragePlan => {
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
export const mapPlanToDb = (plan: ArbitragePlan): Partial<ArbitragePlanDB> => {
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
