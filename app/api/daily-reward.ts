import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/firebaseConfig';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      const userDocRef = doc(db, 'users', userId as string);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userDoc.data();
      res.status(200).json(userData.dailyReward);
    } catch (error) {
      console.error('Failed to fetch daily reward data:', error);
      res.status(500).json({ error: 'Failed to fetch daily reward data' });
    }
  } else if (req.method === 'PATCH') {
    const { userId, lastClaimed, streak, day, completed } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      const userDocRef = doc(db, 'users', userId as string);
      const gameDataRef = doc(db, 'gameData', userId as string);
      
      const reward = 1000; // Fixed daily reward

      await updateDoc(userDocRef, {
        'dailyReward.lastClaimed': lastClaimed,
        'dailyReward.streak': streak,
        'dailyReward.day': day,
        'dailyReward.completed': completed,
        'coins': increment(reward)
      });

      await updateDoc(gameDataRef, {
        'dailyReward.lastClaimed': lastClaimed,
        'dailyReward.streak': streak,
        'dailyReward.day': day,
        'dailyReward.completed': completed,
        'coins': increment(reward)
      });

      const updatedUserDoc = await getDoc(userDocRef);
      const updatedUserData = updatedUserDoc.data();
      
      if (updatedUserData && updatedUserData.dailyReward) {
        res.status(200).json({
          ...updatedUserData.dailyReward,
          reward
        });
      } else {
        res.status(500).json({ error: 'Failed to update daily reward data' });
      }
    } catch (error) {
      console.error('Failed to update daily reward data:', error);
      res.status(500).json({ error: 'Failed to update daily reward data' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

