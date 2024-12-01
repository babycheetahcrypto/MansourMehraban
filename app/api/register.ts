import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const {
    telegramId,
    username,
    firstName,
    lastName,
    coins = 0,
    level = 1,
    exp = 0,
    profilePhoto,
    shopItems = [],
    premiumShopItems = [],
    tasks = [],
    unlockedLevels = [1],
    clickPower = 1,
    friendsCoins = {},
    energy = 500,
    pphAccumulated = 0,
    multiplier = 1,
    multiplierEndTime = null,
    boosterCooldown = null,
    selectedCoinImage = null,
    settings = { vibration: true, backgroundMusic: false, soundEffect: true },
    profitPerHour = 0,
    walletAddress,
  } = req.body;

  if (!telegramId || !username) {
    return res.status(400).json({ error: 'Telegram ID and username are required' });
  }

  try {
    const user = await prisma.user.create({
      data: {
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
        shopItems: {
          create: shopItems.map((item: any) => ({
            name: item.name,
            image: item.image,
            basePrice: item.basePrice,
            baseProfit: item.baseProfit,
            level: item.level || 1,
            quantity: item.quantity || 0,
          })),
        },
        premiumShopItems: {
          create: premiumShopItems.map((item: any) => ({
            name: item.name,
            image: item.image,
            basePrice: item.basePrice,
            effect: item.effect,
            level: item.level || 1,
            duration: item.duration,
          })),
        },
        tasks: {
          create: tasks.map((task: any) => ({
            type: task.type,
            description: task.description,
            progress: task.progress || 0,
            maxProgress: task.maxProgress,
            reward: task.reward,
            completed: task.completed || false,
            claimed: task.claimed || false,
            expiresAt: task.expiresAt,
          })),
        },
        dailyReward: {
          create: {
            lastClaimed: null,
            streak: 0,
            day: 1,
            completed: false,
          },
        },
        wallet: walletAddress
          ? {
              create: {
                address: walletAddress,
              },
            }
          : undefined,
      },
      include: {
        shopItems: true,
        premiumShopItems: true,
        tasks: true,
        dailyReward: true,
        wallet: true,
      },
    });

    // Create initial trophies for the user
    const initialTrophies = [
      {
        name: 'Crypto Novice',
        description: 'First steps into the digital realm',
        image:
          'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1T-nUWKYBAKLuUbRUCtQ4Pe6bKVvuayqD.png',
        requirement: 10000,
        reward: 1000,
      },
      {
        name: 'Blockchain Pioneer',
        description: 'Exploring the foundations of crypto',
        image:
          'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2T-qkckZRo7F2pFbjOXFUsmZW1aVDaKkX.png',
        requirement: 50000,
        reward: 5000,
      },
      {
        name: 'DeFi Explorer',
        description: 'Venturing into decentralized finance',
        image:
          'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3T-S4ZJ26mqOyNGPIIBKrLLwkozCZFPru.png',
        requirement: 100000,
        reward: 10000,
      },
      {
        name: 'NFT Collector',
        description: 'Embracing the world of digital art',
        image:
          'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4T-8R9RicTTe3vC5WD0wWAY7OCNaF1vxx.png',
        requirement: 250000,
        reward: 25000,
      },
      {
        name: 'Hodl Master',
        description: 'Showing true diamond hands',
        image:
          'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5T-QEssxxIveH9hiQ0nJcZZrmdJJguJbF.png',
        requirement: 500000,
        reward: 50000,
      },
      {
        name: 'Altcoin Adventurer',
        description: 'Diversifying beyond Bitcoin',
        image:
          'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6T-fnsT0zSHQjez6E6KHO3AjIwflnyT1P.png',
        requirement: 1000000,
        reward: 100000,
      },
      {
        name: 'Smart Contract Sage',
        description: 'Mastering the art of crypto automation',
        image:
          'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/7T-2DEkkrvJaawGC1O7GADjiHOn8RQfia.png',
        requirement: 2500000,
        reward: 250000,
      },
      {
        name: 'Crypto Whale',
        description: 'Making waves in the digital ocean',
        image:
          'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8T-i7iib3r4xoqtY9qYHdrOOgiUflPOCu.png',
        requirement: 5000000,
        reward: 500000,
      },
      {
        name: 'Metaverse Mogul',
        description: 'Conquering virtual worlds',
        image:
          'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9T-FOz1XZIhMkDitSvZsKOFXfYkP6QdQt.png',
        requirement: 7500000,
        reward: 750000,
      },
      {
        name: 'Crypto Legend',
        description: 'Achieving legendary status in the crypto world',
        image:
          'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/10-m1ABpvscvGrraWnHOclc7sLK531TqB.png',
        requirement: 10000000,
        reward: 1000000,
      },
    ];

    await prisma.trophy.createMany({
      data: initialTrophies.map((trophy) => ({
        ...trophy,
        userId: user.id,
        claimed: false,
      })),
    });

    // Create initial friend invites (if any)
    if (req.body.friendInvites) {
      await prisma.friendInvite.createMany({
        data: req.body.friendInvites.map((invite: any) => ({
          inviterId: user.id,
          inviteeId: invite.inviteeId,
          status: invite.status || 'pending',
        })),
      });
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        ...user,
        trophies: initialTrophies,
        friendInvites: req.body.friendInvites || [],
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Error registering user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
