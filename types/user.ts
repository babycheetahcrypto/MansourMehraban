export interface User {
  id: string;
  telegramId: string;
  username: string;
  name: string;
  coins: number;
  level: number;
  exp: number;
  profilePhoto: string;
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
    backgroundMusic: boolean;
    soundEffect: boolean;
    backgroundMusicAudio: HTMLAudioElement | null;
  };
  profitPerHour: number;
}

export interface ShopItem {
  id: string;
  userId: string;
  name: string;
  image: string;
  basePrice: number;
  baseProfit: number;
  level: number;
  quantity: number;
}

export interface PremiumShopItem {
  id: string;
  userId: string;
  name: string;
  image: string;
  basePrice: number;
  effect: string;
  level: number;
  duration?: number;
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
