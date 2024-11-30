export interface ShopItem {
  id: number;
  name: string;
  image: string;
  basePrice: number;
  baseProfit: number;
  level: number;
}

export interface PremiumShopItem {
  id: number;
  name: string;
  image: string;
  basePrice: number;
  effect: string;
  level: number;
}

export interface Task {
  id: number;
  description: string;
  reward: number;
  progress: number;
  maxProgress?: number;
  completed: boolean;
  claimed: boolean;
  icon: React.ReactNode;
  action: () => void;
}

export interface LeaderboardEntry {
  id: string;
  telegramId: string;
  name: string;
  coins: number;
  profitPerHour: number;
  rank: number;
}
