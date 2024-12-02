export interface User {
  name: string;
  coins: number;
  level: number;
  exp: number;
  profilePhoto: string;
  telegramId: string;
  shopItems: ShopItem[];
  premiumShopItems: PremiumShopItem[];
  tasks: Task[];
  dailyReward: {
    lastClaimed: Date | null;
    streak: number;
    day: number;
    completed: boolean;
  };
  unlockedLevels: number[];
  clickPower: number;
  friendsCoins: Record<string, number>;
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
}

export interface UserData extends User {
  id: number;
  lastUpdated: Date;
  profitPerHour: number;
}

export interface ShopItem {
  id: string;
  name: string;
  image: string;
  basePrice: number;
  baseProfit: number;
  level: number;
  quantity: number;
}

export interface PremiumShopItem {
  id: string;
  name: string;
  image: string;
  basePrice: number;
  effect: string;
  level: number;
  duration?: number;
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

export interface FriendInvite {
  id: string;
  inviterId: string;
  inviteeId: string;
  status: 'pending' | 'accepted' | 'rejected';
  inviter: {
    username: string;
    profilePhoto: string | null;
  };
  invitee: {
    username: string;
    profilePhoto: string | null;
  };
}

export interface Task {
  id: string;
  name: string;
  description: string;
  reward: number;
  completed: boolean;
}
