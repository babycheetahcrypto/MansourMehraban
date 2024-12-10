// pages/api/users.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Create a new user
    const { telegramId, username, firstName, lastName } = req.body;

    try {
      const user = await prisma.user.create({
        data: {
          telegramId,
          username,
          firstName,
          lastName,
          profilePhoto: '', // Provide a default value for profilePhoto
          coins: 0,
          level: 1,
          exp: 0,
          unlockedLevels: [1],
          clickPower: 1,
          energy: 500,
        },
      });
      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Error creating user' });
    }
  } else if (req.method === 'GET') {
    // Fetch a user
    const { telegramId } = req.query;

    try {
      const user = await prisma.user.findUnique({
        where: { telegramId: telegramId as string },
      });
      res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Error fetching user' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
