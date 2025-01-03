import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { User } from '@/types/user';
import { GameData } from '@/types/game-data';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { telegramId } = req.query;
    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID is required' });
    }

    try {
      const userDocRef = doc(db, 'users', telegramId as string);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        
        // Fetch game data
        const gameDataDocRef = doc(db, 'gameData', telegramId as string);
        const gameDataDoc = await getDoc(gameDataDocRef);
        const gameData = gameDataDoc.exists() ? gameDataDoc.data() as GameData : null;

        res.status(200).json({ user: userData, gameData });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PATCH') {
    const { telegramId, userData, gameData } = req.body;
    if (!telegramId || (!userData && !gameData)) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    try {
      const userDocRef = doc(db, 'users', telegramId);
      const gameDataDocRef = doc(db, 'gameData', telegramId);

      if (userData) {
        await updateDoc(userDocRef, {
          ...userData,
          lastUpdated: serverTimestamp(),
        });
      }

      if (gameData) {
        await updateDoc(gameDataDocRef, {
          ...gameData,
          lastUpdated: serverTimestamp(),
        });
      }

      res.status(200).json({ message: 'Data updated successfully' });
    } catch (error) {
      console.error('Error updating data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    const { telegramId, userData, gameData } = req.body;
    if (!telegramId || !userData || !gameData) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    try {
      const userDocRef = doc(db, 'users', telegramId);
      const gameDataDocRef = doc(db, 'gameData', telegramId);

      await setDoc(userDocRef, {
        ...userData,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      });

      await setDoc(gameDataDocRef, {
        ...gameData,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      });

      res.status(201).json({ message: 'User and game data created successfully' });
    } catch (error) {
      console.error('Error creating user and game data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PATCH', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

