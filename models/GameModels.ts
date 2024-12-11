import mongoose from 'mongoose';

// User Schema
const UserSchema = new mongoose.Schema({
  telegramId: String,
  username: String,
  firstName: String,
  lastName: String,
  coins: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  exp: { type: Number, default: 0 },
  profilePhoto: String,
  shopItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ShopItem' }],
  premiumShopItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PremiumShopItem' }],
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  dailyReward: {
    lastClaimed: Date,
    streak: { type: Number, default: 0 },
    day: { type: Number, default: 1 },
    completed: { type: Boolean, default: false },
  },
  unlockedLevels: [Number],
  clickPower: { type: Number, default: 1 },
  friendsCoins: { type: Map, of: Number },
  energy: { type: Number, default: 500 },
  pphAccumulated: { type: Number, default: 0 },
  multiplier: { type: Number, default: 1 },
  multiplierEndTime: Date,
  boosterCooldown: Date,
  selectedCoinImage: String,
  settings: {
    vibration: { type: Boolean, default: true },
    backgroundMusic: { type: Boolean, default: false },
    soundEffect: { type: Boolean, default: true },
  },
  profitPerHour: { type: Number, default: 0 },
});

// ShopItem Schema
const ShopItemSchema = new mongoose.Schema({
  name: String,
  image: String,
  basePrice: Number,
  baseProfit: Number,
  level: { type: Number, default: 1 },
});

// PremiumShopItem Schema
const PremiumShopItemSchema = new mongoose.Schema({
  name: String,
  image: String,
  basePrice: Number,
  effect: String,
  level: { type: Number, default: 1 },
});

// Task Schema
const TaskSchema = new mongoose.Schema({
  description: String,
  reward: Number,
  progress: { type: Number, default: 0 },
  maxProgress: Number,
  completed: { type: Boolean, default: false },
  claimed: { type: Boolean, default: false },
  icon: String,
  action: String,
});

// Create models
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const ShopItem = mongoose.models.ShopItem || mongoose.model('ShopItem', ShopItemSchema);
export const PremiumShopItem =
  mongoose.models.PremiumShopItem || mongoose.model('PremiumShopItem', PremiumShopItemSchema);
export const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);
