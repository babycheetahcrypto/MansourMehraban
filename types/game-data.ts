export interface GameData {
  userId: string;
  level: number;
  exp: number;
  clickPower: number;
  energy: number;
  multiplier: number;
  profitPerHour: number;
  boosterCredits: number;
  unlockedLevels: number[];
  pphAccumulated: number;
  selectedCoinImage: string;
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

