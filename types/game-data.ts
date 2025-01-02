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
      lastClaimed: Date | null;
      streak: number;
      day: number;
      completed: boolean;
    };
    multiplierEndTime: Date | null;
    boosterCooldown: Date | null;
    lastBoosterReset: string | null;
  }
  
  