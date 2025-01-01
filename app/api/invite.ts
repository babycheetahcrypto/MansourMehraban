import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/firebaseConfig';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, friendId } = req.body;

    if (!userId || !friendId) {
      return res.status(400).json({ error: 'User ID and Friend ID are required' });
    }

    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userDoc.data();

      // Update user's friendsCoins
      const updatedFriendsCoins = {
        ...userData.friendsCoins,
        [friendId]: 0,
      };

      // Add coins to the user for inviting a friend
      const inviteReward = 2000;
      await updateDoc(userDocRef, {
        friendsCoins: updatedFriendsCoins,
        coins: increment(inviteReward),
      });

      const updatedUserDoc = await getDoc(userDocRef);
      const updatedUser = updatedUserDoc.data();

      res.status(200).json({ message: 'Friend invited successfully', user: updatedUser });
    } catch (error) {
      console.error('Error inviting friend:', error);
      res.status(500).json({ error: 'Failed to process invitation' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}