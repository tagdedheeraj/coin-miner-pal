
export interface ArbitragePlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  dailyEarnings: number;
  miningSpeed: string;
  totalEarnings: number;
  withdrawal: string;
  color: string;
  limited: boolean;
  limitedTo?: number;
}

// Used for database mapping
export interface ArbitragePlanDB {
  id: string;
  name: string;
  price: number;
  duration: number;
  daily_earnings: number;
  mining_speed: string;
  total_earnings: number;
  withdrawal: string;
  color: string;
  limited: boolean;
  limited_to?: number;
}
