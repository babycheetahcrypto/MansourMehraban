import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Valid User ID is required' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { level: true, exp: true, unlockedLevels: true },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    const { userId, level, exp, unlockedLevels } = req.body;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Valid User ID is required' });
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          level: level !== undefined ? level : undefined,
          exp: exp !== undefined ? exp : undefined,
          unlockedLevels: unlockedLevels !== undefined ? unlockedLevels : undefined,
        },
        select: { level: true, exp: true, unlockedLevels: true },
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
