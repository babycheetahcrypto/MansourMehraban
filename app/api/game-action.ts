import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { telegramId, action, amount } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      if (action === 'tap' || action === 'claim') {
        await prisma.user.update({
          where: { id: user.id },
          data: { coins: user.coins + amount },
        });
      } else if (action === 'purchase') {
        // Handle purchase logic here
      }

      res.status(200).json({ message: 'Game action processed successfully.' });
    } catch (error) {
      console.error('Error processing game action:', error);
      res.status(500).json({ error: 'An error occurred while processing the game action.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}