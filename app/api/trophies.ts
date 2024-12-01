import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      const trophies = await prisma.trophy.findMany({
        where: { userId: userId as string },
      });
      res.status(200).json(trophies);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    const { userId, trophyId } = req.body;

    if (!userId || !trophyId) {
      return res.status(400).json({ error: 'User ID and Trophy ID are required' });
    }

    try {
      const updatedTrophy = await prisma.trophy.update({
        where: { id: trophyId },
        data: { claimed: true, unlockedAt: new Date() },
      });

      res.status(200).json(updatedTrophy);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
