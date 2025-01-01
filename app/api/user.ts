import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
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
      await updateDoc(userDocRef, updateData);

      const updatedUserDoc = await getDoc(userDocRef);
      res.status(200).json(updatedUserDoc.data() as User);
    } else if (req.method === 'POST') {
      const userData: User = req.body;

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

