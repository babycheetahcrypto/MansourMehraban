import { NextApiRequest, NextApiResponse } from 'next';
import { dbOperations } from 'telegram-bot';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { telegramId, username, firstName, lastName } = req.body;

    try {
      let user = await dbOperations.getUser(telegramId);

      if (!user) {
        user = await dbOperations.createUser({
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
        });
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