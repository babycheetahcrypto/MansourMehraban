import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Valid User ID is required' });
    }

    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userDoc.data();
      res.status(200).json({
        level: userData.level,
        exp: userData.exp,
        unlockedLevels: userData.unlockedLevels
      });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    const { userId, level, exp, unlockedLevels } = req.body;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Valid User ID is required' });
    }

    try {
      const userDocRef = doc(db, 'users', userId);
      const updateData: any = {};
      if (level !== undefined) updateData.level = level;
      if (exp !== undefined) updateData.exp = exp;
      if (unlockedLevels !== undefined) updateData.unlockedLevels = unlockedLevels;

      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();

      if (userData) {
        if (level !== undefined && level > userData.level) {
          const levelUpReward = 1000 * level;
          updateData.coins = increment(levelUpReward);
        }

        await updateDoc(userDocRef, updateData);

        const updatedUserDoc = await getDoc(userDocRef);
        const updatedUserData = updatedUserDoc.data();

        if (updatedUserData) {
          res.status(200).json({
            level: updatedUserData.level ?? null,
            exp: updatedUserData.exp ?? null,
            unlockedLevels: updatedUserData.unlockedLevels ?? null,
            coins: updatedUserData.coins ?? null
          });
        } else {
          res.status(500).json({ error: 'Failed to update user data' });
        }
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

