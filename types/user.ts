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
  shopItems: ShopItem[];
  premiumShopItems: PremiumShopItem[];
  tasks: Task[];
  dailyReward: DailyReward;
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
    backgroundMusic: boolean;
    soundEffect: boolean;
  };
  profitPerHour: number;
  invitedFriends: string[];
}

export interface ShopItem {
  id: string;
  userId: string;
  name: string;
  image: string;
  basePrice: number;
  baseProfit: number;
  level: number;
}

export interface PremiumShopItem {
  id: string;
  userId: string;
  name: string;
  image: string;
  basePrice: number;
  effect: string;
  level: number;
}

export interface Task {
  id: string;
  userId: string;
  type: string;
  description: string;
  progress: number;
  maxProgress: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
  expiresAt: Date | null;
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

export interface DailyReward {
  id: string;
  userId: string;
  lastClaimed: Date | null;
  streak: number;
  day: number;
  completed: boolean;
}

export interface ReferralReward {
  id: string;
  userId: string;
  referredId: string;
  amount: number;
  claimed: boolean;
  claimedAt: Date | null;
}

export interface FriendInvite {
  id: string;
  inviterId: string;
  inviteeId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  coins: number;
  rank: number;
}

export interface Wallet {
  id: string;
  userId: string;
  address: string;
  balance: number;
}
