import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const {
    telegramId,
    username,
    coins = 0,
    level = 1,
    exp = 0,
    profilePhoto,
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
          create: [
            {
              name: 'Basic Miner',
              image: 'basic_miner.png',
              basePrice: 100,
              baseProfit: 1,
              level: 1,
              quantity: 0,
            },
          ],
        },
        premiumShopItems: {
          create: [
            {
              name: 'Profit Booster',
              image: 'profit_booster.png',
              basePrice: 1000,
              effect: 'Increases profit by 50% for 1 hour',
              level: 1,
              duration: 3600,
            },
          ],
        },
        tasks: {
          create: [
            {
              type: 'daily',
              description: 'Click 100 times',
              progress: 0,
              maxProgress: 100,
              reward: 50,
              completed: false,
              claimed: false,
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
          ],
        },
        dailyReward: {
          create: {
            lastClaimed: null,
            streak: 0,
            day: 1,
            completed: false,
          },
        },
      },
      include: {
        shopItems: true,
        premiumShopItems: true,
        tasks: true,
        dailyReward: true,
      },
    });

    // Create initial trophies for the user
    const initialTrophies = [
      {
        name: 'Crypto Novice',
        description: 'First steps into the digital realm',
        requirement: 10000,
        reward: 1000,
        image:
          'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1T-nUWKYBAKLuUbRUCtQ4Pe6bKVvuayqD.png',
      },
      {
        name: 'Blockchain Pioneer',
        description: 'Exploring the foundations of crypto',
        requirement: 50000,
        reward: 5000,
        image:
          'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2T-qkckZRo7F2pFbjOXFUsmZW1aVDaKkX.png',
      },
      {
        name: 'DeFi Explorer',
        description: 'Venturing into decentralized finance',
        requirement: 100000,
        reward: 10000,
        image:
          'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3T-S4ZJ26mqOyNGPIIBKrLLwkozCZFPru.png',
      },
      {
        name: 'NFT Collector',
        description: 'Embracing the world of digital art',
        requirement: 250000,
        reward: 25000,
        image:
          'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4T-8R9RicTTe3vC5WD0wWAY7OCNaF1vxx.png',
      },
      {
        name: 'Hodl Master',
        description: 'Showing true diamond hands',
        requirement: 500000,
        reward: 50000,
        image:
          'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5T-QEssxxIveH9hiQ0nJcZZrmdJJguJbF.png',
      },
      {
        name: 'Altcoin Adventurer',
        description: 'Diversifying beyond Bitcoin',
        requirement: 1000000,
        reward: 100000,
        image:
          'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6T-fnsT0zSHQjez6E6KHO3AjIwflnyT1P.png',
      },
      {
        name: 'Smart Contract Sage',
        description: 'Mastering the art of crypto automation',
        requirement: 2500000,
        reward: 250000,
        image:
          'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/7T-2DEkkrvJaawGC1O7GADjiHOn8RQfia.png',
      },
      {
        name: 'Crypto Whale',
        description: 'Making waves in the digital ocean',
        requirement: 5000000,
        reward: 500000,
        image:
          'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8T-i7iib3r4xoqtY9qYHdrOOgiUflPOCu.png',
      },
      {
        name: 'Metaverse Mogul',
        description: 'Conquering virtual worlds',
        requirement: 7500000,
        reward: 750000,
        image:
          'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9T-FOz1XZIhMkDitSvZsKOFXfYkP6QdQt.png',
      },
      {
        name: 'Crypto Legend',
        description: 'Achieving legendary status in the crypto world',
        requirement: 10000000,
        reward: 1000000,
        image:
          'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/10-m1ABpvscvGrraWnHOclc7sLK531TqB.png',
      },
      // Add more initial trophies here
    ];

    await prisma.trophy.createMany({
      data: initialTrophies.map((trophy) => ({
        ...trophy,
        userId: user.id,
        claimed: false,
      })),
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        ...user,
        trophies: initialTrophies,
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
