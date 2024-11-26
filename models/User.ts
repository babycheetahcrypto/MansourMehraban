import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  telegramId: number;
  username: string;
  firstName: string;
  lastName: string;
  coins: number;
  referrals: number;
}

const UserSchema: Schema = new Schema({
  telegramId: { type: Number, required: true, unique: true },
  username: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  coins: { type: Number, default: 0 },
  referrals: { type: Number, default: 0 },
});

export default mongoose.model<IUser>('User ', UserSchema);
