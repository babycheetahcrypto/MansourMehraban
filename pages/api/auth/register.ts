import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../utils/database';
import { User } from '../../../models/User';
import { validateTelegramInitData } from '../../../utils/telegramAuth';

// Replace empty interface with a more meaningful type or remove if not needed
type UserData = {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Ensure database connection
    await connectToDatabase();

    // Validate request method
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Extract Telegram user data and init data
    const { user, initData } = req.body;

    // Validate Telegram init data
    if (!validateTelegramInitData(initData)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate user data
    if (!user || !user.id) {
      return res.status(400).json({ error: 'Invalid user data' });
    }

    // Type assertion and immediate destructuring to handle unused variable warning
    const { id, username, first_name, last_name } = user as UserData;

    // Try to find existing user
    const existingUser = await User.findOne({
      telegramId: id,
    });

    // If user doesn't exist, create new user
    if (!existingUser) {
      const newUser = new User({
        telegramId: id,
        username: username || '',
        firstName: first_name || '',
        lastName: last_name || '',
        referralCode: generateReferralCode(),
        coins: 1000,
        level: 1,
        experience: 0,
        lastActive: new Date(),
      });

      // Save the new user
      await newUser.save();

      // Return new user data
      return res.status(201).json({
        message: 'User registered',
        user: {
          id: newUser.telegramId,
          username: newUser.username,
          coins: newUser.coins,
          level: newUser.level,
          referralCode: newUser.referralCode,
        },
      });
    }

    // If user exists, update last active timestamp
    existingUser.lastActive = new Date();
    await existingUser.save();

    // Return existing user data
    return res.status(200).json({
      message: 'User updated',
      user: {
        id: existingUser.telegramId,
        username: existingUser.username,
        coins: existingUser.coins,
        level: existingUser.level,
        referralCode: existingUser.referralCode,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);

    // Improved error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown registration error';

    res.status(500).json({
      error: 'Registration failed',
      details: errorMessage,
    });
  }
}

// Function to generate a unique referral code
function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}
