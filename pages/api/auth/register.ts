// pages/api/auth/register.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../utils/database';
import { User } from '../../../models/User';
import { validateTelegramInitData } from '../../../middleware/telegramAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate Telegram init data
    const { initData, user } = req.body;
    if (!validateTelegramInitData(initData)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Connect to database
    await connectToDatabase();

    // Check if user already exists
    let existingUser = await User.findOne({ telegramId: user.id });

    if (existingUser) {
      return res.status(200).json({
        user: existingUser,
        message: 'User already exists',
      });
    }

    // Create new user
    const newUser = new User({
      telegramId: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      coins: 1000, // Initial coins
      level: 1,
      experience: 0,
    });

    await newUser.save();

    return res.status(201).json({
      user: newUser,
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
