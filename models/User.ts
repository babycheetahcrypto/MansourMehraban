import mongoose from 'mongoose';

// Define an interface for the User document
export interface IUser extends mongoose.Document {
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  coins: number;
  level: number;
  experience: number;
  referralCode: string;
  referrals: number;
  lastActive: Date;
  walletAddress?: string;
}

// Create the Mongoose schema
const UserSchema = new mongoose.Schema<IUser>(
  {
    telegramId: {
      type: Number,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    coins: {
      type: Number,
      default: 0,
      min: 0,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referrals: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    walletAddress: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    collection: 'users', // Optional: specify collection name
  }
);

// Create a method to generate a referral code
UserSchema.methods.generateReferralCode = function () {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Create a static method to find by Telegram ID
UserSchema.statics.findByTelegramId = function (telegramId: number) {
  return this.findOne({ telegramId });
};

// Compile the model
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
