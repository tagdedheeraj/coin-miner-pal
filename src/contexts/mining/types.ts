
export interface MiningContextType {
  isMining: boolean;
  startMining: () => void;
  stopMining: () => void;
  miningProgress: number;
  timeUntilNextMining: number | null;
  timeUntilMiningCompletes: number | null;
  coinsMinedInSession: number;
  miningRate: number;
  totalCoinsFromMining: number;
  resetMiningCooldown: () => void;
  miningStartTime: Date | null;
  isLoadingMiningState: boolean;
}

export interface MiningState {
  isMining: boolean;
  miningProgress: number;
  lastMiningDate: Date | null;
  coinsMinedInSession: number;
  totalCoinsFromMining: number;
  miningStartTime: Date | null;
  serverTimestamp?: string; // Track server time to prevent manipulation
}
