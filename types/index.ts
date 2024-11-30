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

export interface UserData {
  id: string;
  telegramId: number;
  username: string;
  firstName?: string;
  lastName?: string;
  coins: number;
  lastUpdated: Date;
  level: number;
  exp: number;
  profitPerHour: number;
  shopItems: ShopItem[];
  premiumShopItems: PremiumShopItem[];
  tasks: Task[];
  dailyReward: {
    lastClaimed: string | null;
    streak: number;
    day: number;
    completed: boolean;
  };
  unlockedLevels: number[];
  clickPower: number;
  friendsCoins: { [key: string]: number };
  energy: number;
  pphAccumulated: number;
  multiplier: number;
  multiplierEndTime: number | null;
  boosterCooldown: number | null;
  selectedCoinImage: string;
  settings: {
    vibration: boolean;
    backgroundMusic: boolean;
    soundEffect: boolean;
  };
}
