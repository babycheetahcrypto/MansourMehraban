import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import Cors from 'cors'

// Initializing the cors middleware
const cors = Cors({
  methods: ['GET', 'PATCH'],
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Run the middleware
  await runMiddleware(req, res, cors)

  if (req.method === 'GET') {
    const { telegramId } = req.query;

    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID is required' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { telegramId: telegramId as string },
        include: {
          dailyReward: true,
          shopItems: true,
          premiumShopItems: true,
          tasks: true,
          trophies: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PATCH') {
    const { telegramId, ...updateData } = req.body;

    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID is required' });
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { telegramId: telegramId as string },
        data: {
          ...updateData,
          dailyReward: updateData.dailyReward ? {
            upsert: {
              create: updateData.dailyReward,
              update: updateData.dailyReward,
            },
          } : undefined,
          shopItems: updateData.shopItems ? {
            upsert: updateData.shopItems.map((item: any) => ({
              where: { id: item.id },
              create: item,
              update: item,
            })),
          } : undefined,
          premiumShopItems: updateData.premiumShopItems ? {
            upsert: updateData.premiumShopItems.map((item: any) => ({
              where: { id: item.id },
              create: item,
              update: item,
            })),
          } : undefined,
          tasks: updateData.tasks ? {
            upsert: updateData.tasks.map((task: any) => ({
              where: { id: task.id },
              create: task,
              update: task,
            })),
          } : undefined,
          trophies: updateData.trophies ? {
            upsert: updateData.trophies.map((trophy: any) => ({
              where: { id: trophy.id },
              create: trophy,
              update: trophy,
            })),
          } : undefined,
        },
        include: {
          dailyReward: true,
          shopItems: true,
          premiumShopItems: true,
          tasks: true,
          trophies: true,
        },
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

