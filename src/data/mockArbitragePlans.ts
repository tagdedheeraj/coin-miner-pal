
export interface ArbitragePlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  dailyEarnings: number;
  totalEarnings: number;
  miningSpeed: string;
  withdrawal: string;
  color: string;
  limited: boolean;
  limitedTo?: number;
}

export const mockArbitragePlans: ArbitragePlan[] = [
  {
    id: "1",
    name: "Arbitrage & Starter Plan",
    price: 20,
    duration: 28,
    dailyEarnings: 0.96,
    totalEarnings: 27,
    miningSpeed: "1.2x",
    withdrawal: "24 hour",
    color: "blue",
    limited: false
  },
  {
    id: "2",
    name: "Pro Miner Plan",
    price: 50,
    duration: 28,
    dailyEarnings: 2.14,  // Updated daily earnings
    totalEarnings: 125,
    miningSpeed: "2x",    // Updated mining speed
    withdrawal: "24 hour",
    color: "green",
    limited: false
  },
  {
    id: "3",
    name: "Expert Miner Plan",
    price: 200,
    duration: 39,
    dailyEarnings: 7.18,
    totalEarnings: 280,
    miningSpeed: "3x",
    withdrawal: "24 hour",
    color: "purple",
    limited: false
  },
  {
    id: "4",
    name: "Master Miner Plan",
    price: 500,
    duration: 59,
    dailyEarnings: 13.56,
    totalEarnings: 800,
    miningSpeed: "4x",
    withdrawal: "Instant",
    color: "red",
    limited: false
  },
  {
    id: "5",
    name: "Diamond Miner Plan",
    price: 1000,
    duration: 90,
    dailyEarnings: 24.44,
    totalEarnings: 2200,
    miningSpeed: "5x",
    withdrawal: "Instant",
    color: "cyan",
    limited: true,
    limitedTo: 300
  }
].sort((a, b) => a.price - b.price);
