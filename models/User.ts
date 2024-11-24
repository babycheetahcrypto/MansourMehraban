// models/User.ts
import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  telegramId: number;
  username?: string;
  coins: number;
  level: number;
  tasksCompleted: number;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    telegramId: { type: Number, required: true, unique: true },
    username: { type: String, trim: true },
    coins: { type: Number, default: 1000 },
    level: { type: Number, default: 1 },
    tasksCompleted: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'users' }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User ', UserSchema);
