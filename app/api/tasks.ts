import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      const tasks = await prisma.task.findMany({
        where: { userId: userId as string },
      });
      res.status(200).json(tasks);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    const { userId, taskId, progress } = req.body;

    if (!userId || !taskId) {
      return res.status(400).json({ error: 'User ID and Task ID are required' });
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
