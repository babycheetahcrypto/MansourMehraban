// pages/api/telegramUser .ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { validateTelegramInitData } from '../../utils/telegramAuth'; // Import your validation function

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { initData } = req.body;

    // Validate Telegram init data
    if (!validateTelegramInitData(initData)) {
      return res.status(400).json({ error: 'Invalid init data' });
    }

    try {
      const params = new URLSearchParams(initData);
      const telegramIdStr = params.get('user_id'); // Adjust according to your Telegram data
      const username = params.get('username'); // Adjust according to your Telegram data

      // Ensure telegramId is not null and convert to number
      if (!telegramIdStr) {
        return res.status(400).json({ error: 'User  ID is required' });
      }
      const telegramId = parseInt(telegramIdStr);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { telegramId: telegramId },
      });

      if (existingUser) {
        return res.status(200).json(existingUser);
      }

      // Create a new user
      const newUser = await prisma.user.create({
        data: {
          telegramId: telegramId,
          username: username || null,
          coins: 0,
          referrals: 0,
        },
      });

      return res.status(201).json(newUser);
    } catch (error) {
      console.error('Error saving user data:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
