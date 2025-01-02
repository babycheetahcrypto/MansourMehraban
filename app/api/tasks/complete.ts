import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment, runTransaction } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, taskId } = req.body;

    if (!userId || !taskId) {
      return res.status(400).json({ error: 'User ID and Task ID are required' });
    }

    if (!db) {
      return res.status(500).json({ error: 'Database not initialized' });
    }

    try {
      await runTransaction(db, async (transaction) => {
        const userDocRef = doc(db, 'users', userId);
        const taskDocRef = doc(db, 'tasks', taskId);

        const userDoc = await transaction.get(userDocRef);
        const taskDoc = await transaction.get(taskDocRef);

        if (!userDoc.exists()) {
          throw new Error('User not found');
        }

        if (!taskDoc.exists()) {
          throw new Error('Task not found');
        }

        const userData = userDoc.data();
        const taskData = taskDoc.data();

        if (!userData || !taskData) {
          throw new Error('Invalid user or task data');
        }

        if (taskData.completed) {
          throw new Error('Task already completed');
        }

        transaction.update(userDocRef, {
          coins: increment(taskData.reward),
          exp: increment(taskData.reward),
        });

        transaction.update(taskDocRef, {
          completed: true,
        });
      });

      const updatedUserDoc = await getDoc(doc(db, 'users', userId));
      const updatedTaskDoc = await getDoc(doc(db, 'tasks', taskId));

      res.status(200).json({
        updatedUser: updatedUserDoc.data(),
        completedTask: updatedTaskDoc.data(),
      });
    } catch (error) {
      console.error('Error completing task:', error);
      res.status(500).json({ error: 'Failed to complete task' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

