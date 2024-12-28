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
          },
        });
        console.log('New user created:', user);
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Error creating/updating user:', error);
      res.status(500).json({ error: 'An error occurred while creating/updating the user.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}