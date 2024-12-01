import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      const wallet = await prisma.wallet.findUnique({
        where: { userId: userId as string },
      });

      if (!wallet) {
        return res.status(404).json({ error: 'Wallet not found' });
      }

      res.status(200).json(wallet);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    const { userId, address } = req.body;

    if (!userId || !address) {
      return res.status(400).json({ error: 'User ID and address are required' });
    }

    try {
      const wallet = await prisma.wallet.upsert({
        where: { userId },
        update: { address },
        create: { userId, address },
      });

      res.status(201).json(wallet);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
