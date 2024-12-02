// pages/api/user.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { telegramId } = req.query;

    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID is required' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { telegramId: parseInt(telegramId as string) },
      });

      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    const { telegramId, username, firstName, lastName, profilePhoto } = req.body;

    try {
      const newUser = await prisma.user.create({
        data: {
          telegramId: parseInt(telegramId),
          username,
          profilePhoto,
          coins: 0,
          level: 1,
          exp: 0,
          unlockedLevels: [1],
          clickPower: 1,
          energy: 500,
          multiplier: 1,
          profitPerHour: 0,
        },
      });

      res.status(201).json(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PATCH') {
    const { telegramId, ...updateData } = req.body;

    try {
      const updatedUser = await prisma.user.update({
        where: { telegramId: parseInt(telegramId) },
        data: updateData,
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
