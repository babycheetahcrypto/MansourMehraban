import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { telegramId } = req.query;

    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID is required' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { telegramId: parseInt(telegramId as string) },
        include: {
          shopItems: true,
          premiumShopItems: true,
          tasks: true,
          dailyReward: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    const {
      telegramId,
      username,
      coins,
      level,
      exp,
      profilePhoto,
      shopItems,
      premiumShopItems,
      tasks,
      dailyReward,
      unlockedLevels,
      clickPower,
      friendsCoins,
      energy,
      pphAccumulated,
      multiplier,
      multiplierEndTime,
      boosterCooldown,
      selectedCoinImage,
      settings,
      profitPerHour,
    } = req.body;

    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID is required' });
    }

    try {
      const user = await prisma.user.upsert({
        where: { telegramId: parseInt(telegramId) },
        update: {
          username,
          coins,
          level,
          exp,
          profilePhoto,
          unlockedLevels,
          clickPower,
          friendsCoins,
          energy,
          pphAccumulated,
          multiplier,
          multiplierEndTime,
          boosterCooldown,
          selectedCoinImage,
          settings,
          profitPerHour,
        },
        create: {
          telegramId: parseInt(telegramId),
          username,
          coins,
          level,
          exp,
          profilePhoto,
          unlockedLevels,
          clickPower,
          friendsCoins,
          energy,
          pphAccumulated,
          multiplier,
          multiplierEndTime,
          boosterCooldown,
          selectedCoinImage,
          settings,
          profitPerHour,
        },
      });

      // Update or create related data
      if (shopItems) {
        await Promise.all(
          shopItems.map((item: any) =>
            prisma.shopItem.upsert({
              where: { id: item.id },
              update: { ...item, userId: user.id },
              create: { ...item, userId: user.id },
            })
          )
        );
      }

      if (premiumShopItems) {
        await Promise.all(
          premiumShopItems.map((item: any) =>
            prisma.premiumShopItem.upsert({
              where: { id: item.id },
              update: { ...item, userId: user.id },
              create: { ...item, userId: user.id },
            })
          )
        );
      }

      if (tasks) {
        await Promise.all(
          tasks.map((task: any) =>
            prisma.task.upsert({
              where: { id: task.id },
              update: { ...task, userId: user.id },
              create: { ...task, userId: user.id },
            })
          )
        );
      }

      if (dailyReward) {
        await prisma.dailyReward.upsert({
          where: { userId: user.id },
          update: dailyReward,
          create: { ...dailyReward, userId: user.id },
        });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
