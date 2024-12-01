import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Valid User ID is required' });
    }

    try {
      const referralRewards = await prisma.referralReward.findMany({
        where: { userId },
      });
      res.status(200).json(referralRewards);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    const { userId, referredId, amount } = req.body;

    if (!userId || !referredId || typeof amount !== 'number') {
      return res.status(400).json({ error: 'Valid User ID, Referred ID, and Amount are required' });
    }

    try {
      const newReferralReward = await prisma.referralReward.create({
        data: {
          userId,
          referredId,
          amount,
        },
      });

      res.status(201).json(newReferralReward);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
