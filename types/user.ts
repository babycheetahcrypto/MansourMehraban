export interface User {
  id: string;
  telegramId: string;
  username: string;
  firstName?: string;
  lastName?: string;
  coins: number;
  level: number;
  exp: number;
  profilePhoto: string;
  walletAddress?: string;
  shopItems: any[];
  premiumShopItems: any[];
  tasks: any[];
  dailyReward: {
    lastClaimed: Date | null;
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
  multiplierEndTime: Date | null;
  boosterCooldown: Date | null;
  selectedCoinImage: string;
  settings: {
    vibration: boolean;
  };
  profitPerHour: number;
  boosterCredits: number;
  lastBoosterReset: string | null;
}

export interface CryptoGameProps {
  userData: User | null;
  onCoinsUpdate: (amount: number) => Promise<void>;
  saveUserData: (userData: Partial<User>) => Promise<void>;
}
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
  boosterCredits?: number;
  tap?: number;
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

export interface Trophy {
  id: string;
  userId: string;
  name: string;
  description: string;
  image: string;
  requirement: number;
  reward: number;
  claimed: boolean;
  unlockedAt: Date | null;
}

export interface UserData extends Omit<User, 'dailyReward'> {
  dailyReward: {
    lastClaimed: Date | null;
    streak: number;
    day: number;
    completed: boolean;
  };
}
export interface LeaderboardEntry {
  id: string;
  telegramId: string;
  name: string;
  username: true;
  coins: number;
  profitPerHour: number;
  rank: number;
}

export interface WalletProps {
  coins: number;
}
