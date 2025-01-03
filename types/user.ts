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
  shopItems: any[];
  premiumShopItems: any[];
  tasks: any[];
  dailyReward: {
    lastClaimed: string | null;
    streak: number;
    day: number;
    completed: boolean;
  };
  multiplierEndTime: string | null;
  boosterCooldown: string | null;
  lastBoosterReset: string | null;
}