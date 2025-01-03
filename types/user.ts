import { ReactNode } from 'react';
import { DocumentReference, Timestamp } from 'firebase/firestore';

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
  clickPower: number;
  energy: number;
  multiplier: number;
  profitPerHour: number;
  boosterCredits: number;
  unlockedLevels: number[];
  pphAccumulated: number;
  selectedCoinImage: string;
  friendsCoins: { [key: string]: number };
  shopItems: ShopItem[];
  premiumShopItems: PremiumShopItem[];
  tasks: Task[];
  dailyReward: {
    lastClaimed: string | null;
    streak: number;
    day: number;
    completed: boolean;
  };
  multiplierEndTime: string | null;
  boosterCooldown: string | null;
  lastBoosterReset: string | null;
  lastUpdated?: Timestamp;
  ref?: DocumentReference;
}

export type ShopItem = {
  id: number;
  name: string;
  image: string;
  basePrice: number;
  baseProfit: number;
  level: number;
};

export type PremiumShopItem = {
  id: number;
  name: string;
  image: string;
  basePrice: number;
  effect: string;
  boosterCredits?: number;
  tap?: number;
};

export type Task = {
  id: number;
  description: string;
  reward: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  icon: ReactNode;
  action: () => void;
  type?: 'video';
  videoLink?: string;
  secretCode?: string;
  videoWatched?: boolean;
  maxProgress?: number;
};

export type LeaderboardEntry = {
  id: string;
  telegramId: string;
  name: string;
  username: true;
  coins: number;
  profitPerHour: number;
  rank: number;
};

export interface UserData extends Omit<User, 'dailyReward'> {
  dailyReward: {
    lastClaimed: Date | null;
    streak: number;
    day: number;
    completed: boolean;
  };
}

export interface WalletProps {
  coins: number;
}

export interface CryptoGameProps {
  userData: User | null;
  onCoinsUpdate: (amount: number) => Promise<void>;
  saveUserData: (userData: Partial<User>) => Promise<void>;
}