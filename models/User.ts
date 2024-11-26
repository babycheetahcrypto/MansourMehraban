// models/User.ts
import mongoose, { Document, Model, Schema } from 'mongoose';

interface IUser extends Document {
  telegramId: number;
  username?: string;
  coins: number;
  referrals: number;
}

const userSchema = new Schema<IUser>({
  telegramId: { type: Number, required: true, unique: true },
  coins: { type: Number, default: 0 },
  referrals: { type: Number, default: 0 },
});

const User: Model<IUser> = mongoose.model('User ', userSchema);

export default User;
