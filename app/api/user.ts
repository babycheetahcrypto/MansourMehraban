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

      let user = await prisma.user.findUnique({
        where: { telegramId: parseInt(telegramId as string) },
        include: {
          shopItems: true,
          premiumShopItems: true,
          tasks: true,
          dailyReward: true,
          trophies: true,
          referralRewards: true,
          sentInvites: true,
          receivedInvites: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(user);
    } else if (req.method === 'POST') {
      const { telegramId, username, name, profilePhoto } = req.body;

      if (!telegramId || !username || !name) {
        return res.status(400).json({ error: 'Telegram ID, username, and name are required' });
      }

      const existingUser = await prisma.user.findUnique({
        where: { telegramId: parseInt(telegramId) },
      });

      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      const newUser = await prisma.user.create({
        data: {
          telegramId: parseInt(telegramId),
          username,
          name,
          profilePhoto: profilePhoto || '',
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
          sentInvites: true,
          receivedInvites: true,
        },
      });

      res.status(201).json(newUser);
    } else if (req.method === 'PATCH') {
      const { telegramId, ...updateData } = req.body;

      if (!telegramId) {
        return res.status(400).json({ error: 'Telegram ID is required' });
      }

      const updatedUser = await prisma.user.update({
        where: { telegramId: parseInt(telegramId) },
        data: updateData,
        include: {
          shopItems: true,
          premiumShopItems: true,
          tasks: true,
          dailyReward: true,
          trophies: true,
          referralRewards: true,
          sentInvites: true,
          receivedInvites: true,
        },
      });

      res.status(200).json(updatedUser);
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in user API route:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
