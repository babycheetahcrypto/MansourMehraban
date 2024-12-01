import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('User API route called, method:', req.method);
  console.log('Request body:', req.body);
  console.log('Request query:', req.query);

  try {
    if (req.method === 'GET') {
      const { telegramId } = req.query;

      if (!telegramId) {
        return res.status(400).json({ error: 'Telegram ID is required' });
      }

      const user = await prisma.user.findUnique({
        where: { telegramId: parseInt(telegramId as string) },
        include: {
          shopItems: true,
          premiumShopItems: true,
          tasks: true,
          dailyReward: true,
          wallet: true,
          friendInvites: true,
          sentInvites: true,
          trophies: true,
          referralRewards: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(user);
    } else if (req.method === 'POST') {
      const {
        telegramId,
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
      } = req.body;

      if (!telegramId) {
        return res.status(400).json({ error: 'Telegram ID is required' });
      }

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
          coins: coins || 0,
          level: level || 1,
          exp: exp || 0,
          profilePhoto,
          unlockedLevels: unlockedLevels || [1],
          clickPower: clickPower || 1,
          friendsCoins: friendsCoins || {},
          energy: energy || 500,
          pphAccumulated: pphAccumulated || 0,
          multiplier: multiplier || 1,
          multiplierEndTime,
          boosterCooldown,
          selectedCoinImage,
          settings: settings || { vibration: true, backgroundMusic: false, soundEffect: true },
          profitPerHour: profitPerHour || 0,
        },
      });

      // Fetch the updated user data with all related information
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          shopItems: true,
          premiumShopItems: true,
          tasks: true,
          dailyReward: true,
          wallet: true,
          friendInvites: true,
          sentInvites: true,
          trophies: true,
          referralRewards: true,
        },
      });

      res.status(200).json(updatedUser);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in user API route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
