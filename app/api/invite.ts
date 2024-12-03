import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { inviterId, inviteeId } = req.body;

    if (!inviterId || !inviteeId) {
      return res.status(400).json({ error: 'Inviter ID and Invitee ID are required' });
    }

    try {
      const invite = await prisma.friendInvite.create({
        data: {
          inviterId,
          inviteeId,
          status: 'pending',
        },
      });

      res.status(201).json(invite);
    } catch (error) {
      console.error('Error creating invite:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      const invites = await prisma.friendInvite.findMany({
        where: {
          OR: [{ inviterId: userId as string }, { inviteeId: userId as string }],
        },
        include: {
          inviter: {
            select: { username: true, profilePhoto: true },
          },
          invitee: {
            select: { username: true, profilePhoto: true },
          },
        },
      });

      res.status(200).json(invites);
    } catch (error) {
      console.error('Error fetching invites:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
