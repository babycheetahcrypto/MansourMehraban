import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { userId } = req.query;

      const user = await prisma.user.findUnique({
        where: { id: userId as string },
        select: {
          friendsCoins: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(user.friendsCoins);
    } catch (error) {
      console.error('Error fetching friends activity:', error);
      res.status(500).json({ error: 'Failed to fetch friends activity' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
