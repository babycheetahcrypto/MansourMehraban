import mongoose from 'mongoose';
import { randomBytes } from 'crypto';

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
      default: 1000,
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
      default: () => generateReferralCode(),
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
    timestamps: true,
    collection: 'users',
  }
);

// Generate a unique referral code
export function generateReferralCode(): string {
  return randomBytes(4).toString('hex').toUpperCase();
}

// Create or retrieve the model
export const User = mongoose.models.User || mongoose.model<IUser>('User ', UserSchema);
