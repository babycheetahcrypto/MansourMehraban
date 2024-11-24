// pages/api/auth/register.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { User } from '../../../models/User';
import mongoose from 'mongoose';
import { connectToDatabase } from '../../../utils/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user } = req.body;

  try {
    await connectToDatabase();

    let existingUser = await User.findOne({ telegramId: user.id });

    if (!existingUser) {
      const newUser = new User({
        telegramId: user.id,
        username: user.username,
        coins: 1000,
        level: 1,
        tasksCompleted: 0,
      });
      await newUser.save();
      return res.status(201).json(newUser);
    }

    return res.status(200).json(existingUser);
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
