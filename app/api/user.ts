import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { telegramId } = req.query;

    if (!telegramId || isNaN(Number(telegramId))) {
      return res.status(400).json({ error: 'Valid Telegram ID is required' });
    }
    const telegramIdNumber = Number(telegramId);

    try {
      const user = await prisma.user.findUnique({
        where: { telegramId: telegramIdNumber },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  } else if (req.method === 'POST') {
    const { telegramId, username, firstName, lastName, profilePhoto } = req.body;

    if (!telegramId || isNaN(Number(telegramId))) {
      return res.status(400).json({ error: 'Valid Telegram ID is required' });
    }
    const telegramIdNumber = Number(telegramId);

    try {
      const user = await prisma.user.create({
        data: {
          telegramId: telegramIdNumber,
          username: username || `user${telegramId}`,
          firstName: firstName || '',
          lastName: lastName || '',
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
      return res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  } else if (req.method === 'PATCH') {
    const { telegramId, ...updateData } = req.body;

    if (!telegramId || isNaN(Number(telegramId))) {
      return res.status(400).json({ error: 'Valid Telegram ID is required' });
    }
    const telegramIdNumber = Number(telegramId);

    try {
      const user = await prisma.user.update({
        where: { telegramId: telegramIdNumber },
        data: updateData,
      });

      return res.status(200).json({ user });
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
