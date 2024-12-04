import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { telegramId } = req.query;

    if (!telegramId || typeof telegramId !== 'string') {
      return res.status(400).json({ error: 'Valid Telegram ID is required' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    const { telegramId, username, name, profilePhoto } = req.body;

    if (!telegramId || typeof telegramId !== 'string') {
      return res.status(400).json({ error: 'Valid Telegram ID is required' });
    }

    try {
      const user = await prisma.user.create({
        data: {
          telegramId,
          username: username || `user${telegramId}`,
          name: name || 'Anonymous',
          profilePhoto: profilePhoto || '',
          coins: 0,
          level: 1,
          exp: 0,
          unlockedLevels: [1],
          clickPower: 1,
          energy: 500,
          multiplier: 1,
          settings: { vibration: true, backgroundMusic: false, soundEffect: true },
        },
      });

      return res.status(201).json({ user });
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PATCH') {
    const { telegramId, ...updateData } = req.body;

    if (!telegramId || typeof telegramId !== 'string') {
      return res.status(400).json({ error: 'Valid Telegram ID is required' });
    }

    try {
      const user = await prisma.user.update({
        where: { telegramId },
        data: updateData,
      });

      return res.status(200).json({ user });
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
