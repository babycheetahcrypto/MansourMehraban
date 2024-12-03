import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('User API route called, method:', req.method);
  console.log('Request query:', req.query);
  console.log('Request body:', req.body);

  try {
    if (req.method === 'GET') {
      const { telegramId } = req.query;

      if (!telegramId) {
        return res.status(400).json({ error: 'Telegram ID is required' });
      }

      let user = await prisma.user.findUnique({
        where: { telegramId: parseInt(telegramId as string) },
        include: {
          shopItems: true,
          premiumShopItems: true,
          tasks: true,
          dailyReward: true,
          trophies: true,
          referralRewards: true,
        },
      });

      if (!user) {
        // Create a new user if not found
        user = await prisma.user.create({
          data: {
            telegramId: parseInt(telegramId as string),
            username: `user${telegramId}`,
            coins: 0,
            level: 1,
            exp: 0,
            unlockedLevels: [1],
            clickPower: 1,
            friendsCoins: {},
            energy: 500,
            pphAccumulated: 0,
            multiplier: 1,
            settings: { vibration: true, backgroundMusic: false, soundEffect: true },
            profitPerHour: 0,
            dailyReward: {
              create: {
                lastClaimed: null,
                streak: 0,
                day: 1,
                completed: false,
              },
            },
          },
          include: {
            shopItems: true,
            premiumShopItems: true,
            tasks: true,
            dailyReward: true,
            trophies: true,
            referralRewards: true,
          },
        });
        console.log('Created new user:', user);
      }

      res.status(200).json(user);
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in user API route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
