import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Valid User ID is required' });
    }

    try {
      const tasks = await prisma.task.findMany({
        where: { userId },
      });
      res.status(200).json(tasks);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    const { userId, taskId, progress } = req.body;

    if (
      !userId ||
      !taskId ||
      typeof userId !== 'string' ||
      typeof taskId !== 'string' ||
      typeof progress !== 'number'
    ) {
      return res.status(400).json({ error: 'Valid User ID, Task ID, and progress are required' });
    }

    try {
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { progress, completed: progress >= 100 },
      });

      res.status(200).json(updatedTask);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
