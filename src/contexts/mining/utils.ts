
import { User } from '@/types/auth';

export const calculateMiningRate = (user: User | null): number => {
  if (!user?.activePlans?.length) return 2; // Base rate: 2 coins per hour
  
  // Find the highest mining speed multiplier from active plans
  const highestSpeedMultiplier = user.activePlans.reduce((maxSpeed, plan) => {
    // Check if plan and miningSpeed exist before trying to access replace
    // Default to 1x multiplier if miningSpeed is missing
    let speedValue = 1;
    
    if (plan && plan.miningSpeed) {
      // Remove the 'x' from strings like '2x' and convert to number
      speedValue = parseFloat(plan.miningSpeed.replace('x', ''));
      
      // If parsing fails, default to 1
      if (isNaN(speedValue)) {
        speedValue = 1;
      }
    }
    
    return Math.max(maxSpeed, speedValue);
  }, 1);
  
  // Return base rate multiplied by the speed multiplier
  return 2 * highestSpeedMultiplier;
};

export const MINING_DURATION = 24; // 24 hours
export const HOUR_IN_MS = 3600000; // 1 hour in milliseconds

export interface PersistentMiningState {
  isMining: boolean;
  miningProgress: number;
  lastMiningDate: string | null; // ISO string
  miningStartTime: string | null; // ISO string
  coinsMinedInSession: number;
  totalCoinsFromMining: number;
  userId: string;
}

export const saveMiningState = (state: Omit<PersistentMiningState, 'userId'>, userId: string) => {
  const persistentState: PersistentMiningState = {
    ...state,
    userId
  };
  
  localStorage.setItem('miningState', JSON.stringify(persistentState));
};

export const loadMiningState = (userId: string): PersistentMiningState | null => {
  const savedState = localStorage.getItem('miningState');
  if (!savedState) return null;
  
  try {
    const state = JSON.parse(savedState) as PersistentMiningState;
    
    // Only restore if it's the same user
    if (state.userId !== userId) return null;
    
    // Calculate current progress if mining was in progress
    if (state.isMining && state.miningStartTime) {
      const startTime = new Date(state.miningStartTime).getTime();
      const currentTime = new Date().getTime();
      const elapsedHours = (currentTime - startTime) / HOUR_IN_MS;
      
      // If elapsed time is more than 24 hours, mining is complete
      if (elapsedHours >= MINING_DURATION) {
        // Mining completed while app was closed
        return {
          ...state,
          isMining: false,
          miningProgress: 100,
          lastMiningDate: new Date().toISOString(),
          miningStartTime: null,
          coinsMinedInSession: calculateSessionCoins(elapsedHours, userId)
        };
      }
      
      // Update progress based on elapsed time
      const progress = Math.min((elapsedHours / MINING_DURATION) * 100, 99.9);
      return {
        ...state,
        miningProgress: progress
      };
    }
    
    return state;
  } catch (error) {
    console.error('Failed to parse saved mining state', error);
    return null;
  }
};

// Helper function to calculate coins mined in a session
export const calculateSessionCoins = (elapsedHours: number, userId: string): number => {
  // Get user from localStorage to calculate rate
  const userJson = localStorage.getItem('user');
  if (!userJson) return 0;
  
  try {
    const user = JSON.parse(userJson) as User;
    if (user.id !== userId) return 0;
    
    const miningRate = calculateMiningRate(user);
    const hours = Math.min(elapsedHours, MINING_DURATION);
    return miningRate * Math.floor(hours); // Only count full hours
  } catch (error) {
    console.error('Failed to calculate session coins', error);
    return 0;
  }
};

// Calculate time until mining completes
export const calculateTimeUntilCompletion = (
  startTime: string | null, 
  progress: number
): number | null => {
  if (!startTime) return null;
  
  const start = new Date(startTime).getTime();
  const currentTime = new Date().getTime();
  const elapsedTime = currentTime - start;
  const totalDuration = MINING_DURATION * HOUR_IN_MS;
  const remainingTime = totalDuration - elapsedTime;
  
  return Math.max(0, remainingTime);
};

// Validate mining session to prevent client-side manipulation
export const validateMiningSession = (
  startTime: Date | null,
  progress: number,
  rate: number
): {
  isValid: boolean;
  actualProgress: number;
  coinsEarned: number;
} => {
  if (!startTime) {
    return { isValid: false, actualProgress: 0, coinsEarned: 0 };
  }
  
  const now = new Date();
  const elapsedMs = now.getTime() - startTime.getTime();
  const elapsedHours = elapsedMs / HOUR_IN_MS;
  
  // Calculate what the progress should be based on elapsed time
  const actualProgress = Math.min((elapsedHours / MINING_DURATION) * 100, 100);
  
  // If the reported progress is significantly higher than actual, it's likely manipulation
  const isValid = Math.abs(actualProgress - progress) < 5; // Allow 5% tolerance
  
  // Calculate the coins that should have been earned
  const coinsEarned = Math.floor(elapsedHours) * rate;
  
  return { isValid, actualProgress, coinsEarned };
};
