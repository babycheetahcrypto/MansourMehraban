import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import Cors from 'cors'

const cors = Cors({
  methods: ['GET', 'PATCH'],
})

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
  await runMiddleware(req, res, cors)
  
  console.log(`Received ${req.method} request to /api/user`);
  
  if (req.method === 'GET') {
    const { telegramId } = req.query;

    if (!telegramId) {
      console.error('GET request missing telegramId');
      return res.status(400).json({ error: 'Telegram ID is required' });
    }

    try {
      console.log(`Fetching user data for Telegram ID: ${telegramId}`);
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
        console.log(`User not found for Telegram ID: ${telegramId}`);
        return res.status(404).json({ error: 'User not found' });
      }

      console.log(`User data fetched successfully for Telegram ID: ${telegramId}`);
      res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PATCH') {
    const { telegramId, ...updateData } = req.body;

    if (!telegramId) {
      console.error('PATCH request missing telegramId');
      return res.status(400).json({ error: 'Telegram ID is required' });
    }

    try {
      console.log(`Updating user data for Telegram ID: ${telegramId}`);
      const updatedUser = await prisma.user.upsert({
        where: { telegramId: telegramId as string },
        update: {
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
        create: {
          telegramId: telegramId as string,
          ...updateData,
        },
        include: {
          dailyReward: true,
          shopItems: true,
          premiumShopItems: true,
          tasks: true,
          trophies: true,
        },
      });

      console.log(`User data updated successfully for Telegram ID: ${telegramId}`);
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    console.error(`Unsupported method: ${req.method}`);
    res.setHeader('Allow', ['GET', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

