import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { telegramId, username, firstName, lastName } = req.body;

    try {
      let user = await prisma.user.findUnique({
        where: { telegramId: telegramId },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            telegramId,
            username,
            firstName,
            lastName,
            profilePhoto: '',
            selectedCoinImage: '',
            coins: 0,
            level: 1,
            exp: 0,
            unlockedLevels: [1],
            clickPower: 1,
            friendsCoins: {},
            energy: 2000,
            pphAccumulated: 0,
            multiplier: 1,
            profitPerHour: 0,
            boosterCredits: 1,
            dailyReward: {
              create: {
                lastClaimed: null,
                streak: 0,
                day: 1,
                completed: false,
              }
            },
          },
        });
        console.log('New user created:', user);
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Error creating/updating user:', error);
      res.status(500).json({ error: 'An error occurred while creating/updating the user.' });
    }
  } else if (req.method === 'GET') {
    const { telegramId } = req.query;

    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID is required' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { telegramId: telegramId as string },
        include: {
          dailyReward: true,
          shopItems: true,
          premiumShopItems: true,
          tasks: true,
          trophies: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'An error occurred while fetching the user.' });
    }
  } else if (req.method === 'PATCH') {
    const { id, ...updateData } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'An error occurred while updating the user.' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}