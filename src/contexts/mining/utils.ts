
import { User } from '@/types/auth';

export const calculateMiningRate = (user: User | null): number => {
  if (!user?.activePlans?.length) return 2; // Base rate: 2 coins per hour
  
  // Find the highest mining speed multiplier from active plans
  const highestSpeedMultiplier = user.activePlans.reduce((maxSpeed, plan) => {
    const speedValue = parseFloat(plan.miningSpeed.replace('x', ''));
    return Math.max(maxSpeed, speedValue);
  }, 1);
  
  // Return base rate multiplied by the speed multiplier
  return 2 * highestSpeedMultiplier;
};

export const MINING_DURATION = 24; // 24 hours
export const HOUR_IN_MS = 3600000; // 1 hour in milliseconds

export const saveMiningState = (state: any, userId: string) => {
  localStorage.setItem('miningState', JSON.stringify({
    ...state,
    userId
  }));
};

export const loadMiningState = (userId: string) => {
  const savedState = localStorage.getItem('miningState');
  if (!savedState) return null;
  
  try {
    const state = JSON.parse(savedState);
    return state.userId === userId ? state : null;
  } catch (error) {
    console.error('Failed to parse saved mining state', error);
    return null;
  }
};
