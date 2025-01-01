import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export const updateTrophy = async (userId: string, trophyId: string, data: any) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const trophies = userData.trophies || [];
    const trophyIndex = trophies.findIndex((t: any) => t.id === trophyId);

    if (trophyIndex === -1) {
      throw new Error('Trophy not found');
    }

    trophies[trophyIndex] = { ...trophies[trophyIndex], ...data };

    await updateDoc(userDocRef, { trophies });

    return trophies[trophyIndex];
  } catch (error) {
    console.error("Error updating trophy:", error);
    throw error;
  }
};

export const getTrophy = async (userId: string, trophyId: string) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const trophies = userData.trophies || [];
    const trophy = trophies.find((t: any) => t.id === trophyId);

    if (!trophy) {
      throw new Error('Trophy not found');
    }

    return trophy;
  } catch (error) {
    console.error("Error getting trophy:", error);
    throw error;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { userId, trophyId, data } = req.body;

    try {
      const updatedTrophy = await updateTrophy(userId, trophyId, data);
      res.status(200).json(updatedTrophy);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update trophy' });
    }
  } else if (req.method === 'GET') {
    const { userId, trophyId } = req.query;

    try {
      const trophy = await getTrophy(userId as string, trophyId as string);
      res.status(200).json(trophy);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get trophy' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}