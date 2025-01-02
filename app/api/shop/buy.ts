import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/firebaseConfig';
import { doc, getDoc, updateDoc, runTransaction } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, itemId } = req.body;

    if (!userId || !itemId) {
      return res.status(400).json({ error: 'User ID and Item ID are required' });
    }

    if (!db) {
      return res.status(500).json({ error: 'Database not initialized' });
    }

    try {
      const result = await runTransaction(db, async (transaction) => {
        const userDocRef = db ? doc(db, 'users', userId) : null;
        const gameDataRef = db ? doc(db, 'gameData', userId) : null;
        const itemDocRef = db ? doc(db, 'shopItems', itemId) : null;

        if (!userDocRef || !gameDataRef || !itemDocRef) {
          throw new Error('Failed to create document references');
        }

        const userDoc = await transaction.get(userDocRef);
        const gameDataDoc = await transaction.get(gameDataRef);
        const itemDoc = await transaction.get(itemDocRef);

        if (!userDoc.exists() || !gameDataDoc.exists()) {
          throw new Error('User or game data not found');
        }

        if (!itemDoc.exists()) {
          throw new Error('Item not found');
        }

        const userData = userDoc.data();
        const gameData = gameDataDoc.data();
        const itemData = itemDoc.data();

        if (!userData || !gameData || !itemData) {
          throw new Error('Invalid user, game, or item data');
        }

        const currentPrice = itemData.basePrice * Math.pow(1.5, itemData.level - 1);

        if (userData.coins < currentPrice) {
          throw new Error('Not enough coins');
        }

        const newLevel = itemData.level + 1;
        const newProfit = itemData.baseProfit * newLevel;

        transaction.update(userDocRef, {
          coins: userData.coins - currentPrice,
          profitPerHour: userData.profitPerHour + itemData.baseProfit,
          clickPower: userData.clickPower + 1
        });

        transaction.update(gameDataRef, {
          coins: gameData.coins - currentPrice,
          profitPerHour: gameData.profitPerHour + itemData.baseProfit,
          clickPower: gameData.clickPower + 1
        });

        transaction.update(itemDocRef, {
          level: newLevel,
        });

        return { 
          newProfit, 
          updatedUser: { 
            ...userData, 
            coins: userData.coins - currentPrice, 
            profitPerHour: userData.profitPerHour + itemData.baseProfit,
            clickPower: userData.clickPower + 1
          },
          updatedGameData: {
            ...gameData,
            coins: gameData.coins - currentPrice,
            profitPerHour: gameData.profitPerHour + itemData.baseProfit,
            clickPower: gameData.clickPower + 1
          }
        };
      });

      res.status(200).json({
        updatedUser: result.updatedUser,
        updatedGameData: result.updatedGameData,
        newProfit: result.newProfit,
      });
    } catch (error) {
      console.error('Error purchasing item:', error);
      res.status(500).json({ error: 'Failed to process purchase' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

