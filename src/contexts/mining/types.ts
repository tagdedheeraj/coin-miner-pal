
export interface MiningContextType {
  isMining: boolean;
  startMining: () => void;
  stopMining: () => void;
  miningProgress: number;
  timeUntilNextMining: number | null;
  coinsMinedInSession: number;
  miningRate: number;
  totalCoinsFromMining: number;
  resetMiningCooldown: () => void;
}

export interface MiningState {
  isMining: boolean;
  miningProgress: number;
  lastMiningDate: Date | null;
  coinsMinedInSession: number;
  totalCoinsFromMining: number;
}
