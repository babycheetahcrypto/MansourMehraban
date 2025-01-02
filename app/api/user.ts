import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { User } from '@/types/user';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { telegramId } = req.query;

      if (!telegramId) {
        return res.status(400).json({ error: 'Telegram ID is required' });
      }

      const userDocRef = doc(db, 'users', telegramId as string);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        res.status(200).json(userDoc.data() as User);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } else if (req.method === 'PATCH') {
      const { telegramId, ...updateData } = req.body;

      if (!telegramId) {
        return res.status(400).json({ error: 'Telegram ID is required' });
      }

      const userDocRef = doc(db, 'users', telegramId);
      await updateDoc(userDocRef, {
        ...updateData,
        lastActive: new Date().toISOString(),
        coins: increment(updateData.coins || 0),
        exp: increment(updateData.exp || 0)
      });

      const updatedUserDoc = await getDoc(userDocRef);
      res.status(200).json(updatedUserDoc.data() as User);
    } else if (req.method === 'POST') {
      const userData: User = {
        ...req.body,
        lastActive: new Date().toISOString(),
        coins: 0,
        level: 1,
        exp: 0,
        clickPower: 1,
        profitPerHour: 0,
        boosterCredits: 1,
        energy: 2000,
        pphAccumulated: 0,
        multiplier: 1,
        multiplierEndTime: null,
        boosterCooldown: null,
        unlockedLevels: [1],
        shopItems: [],
        premiumShopItems: [],
        tasks: [],
        dailyReward: {
          lastClaimed: null,
          streak: 0,
          day: 1,
          completed: false,
        },
        friendsCoins: {},
      };

      if (!userData.telegramId) {
        return res.status(400).json({ error: 'Telegram ID is required' });
      }

      const userDocRef = doc(db, 'users', userData.telegramId);
      await setDoc(userDocRef, userData);

      res.status(201).json({ message: 'User created successfully', user: userData });
    } else {
      res.setHeader('Allow', ['GET', 'PATCH', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in user API:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

