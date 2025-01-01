import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, taskId } = req.body;

    if (!userId || !taskId) {
      return res.status(400).json({ error: 'User ID and Task ID are required' });
    }

    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          coins: { increment: task.reward },
          exp: { increment: task.reward }, // Using reward as exp since expReward doesn't exist
          tasks: {
            update: {
              where: { id: taskId },
              data: { completed: true },
            },
          },
        },
        include: { tasks: true },
      });

      res.status(200).json({
        updatedUser,
        completedTask: task,
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

