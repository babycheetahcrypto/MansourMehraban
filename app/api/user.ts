import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('User API route called, method:', req.method);
  console.log('Request body:', req.body);
  console.log('Request query:', req.query);

  try {
    if (req.method === 'GET') {
      const { telegramId } = req.query;

      if (!telegramId) {
        return res.status(400).json({ error: 'Telegram ID is required' });
      }

      const user = await prisma.user.findUnique({
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
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(user);
    } else if (req.method === 'POST') {
      const {
        telegramId,
        username,
        name,
        profilePhoto,
        coins = 0,
        level = 1,
        exp = 0,
        unlockedLevels = [1],
        clickPower = 1,
        friendsCoins = {},
        energy = 500,
        pphAccumulated = 0,
        multiplier = 1,
        multiplierEndTime = null,
        boosterCooldown = null,
        selectedCoinImage = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Real%20Crypto%20Coin-18dhTdsht8Pjj7dxXNDrLPOBpBWapH.png',
        settings = { vibration: true, backgroundMusic: false, soundEffect: true },
        profitPerHour = 0,
      } = req.body;

      if (!telegramId) {
        return res.status(400).json({ error: 'Telegram ID is required' });
      }

      const user = await prisma.user.upsert({
        where: { telegramId: parseInt(telegramId) },
        update: {
          username,
          profilePhoto,
          coins,
          level,
          exp,
          unlockedLevels,
          clickPower,
          friendsCoins,
          energy,
          pphAccumulated,
          multiplier,
          multiplierEndTime,
          boosterCooldown,
          selectedCoinImage,
          settings,
          profitPerHour,
        },
        create: {
          telegramId: parseInt(telegramId),
          username,
          profilePhoto,
          coins,
          level,
          exp,
          unlockedLevels,
          clickPower,
          friendsCoins,
          energy,
          pphAccumulated,
          multiplier,
          multiplierEndTime,
          boosterCooldown,
          selectedCoinImage,
          settings,
          profitPerHour,
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

      res.status(200).json(user);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in user API route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
