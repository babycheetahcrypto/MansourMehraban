import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Valid User ID is required' });
    }

    try {
      const sentInvites = await prisma.friendInvite.findMany({
        where: { inviterId: userId },
        include: {
          invitee: {
            select: { username: true, profilePhoto: true },
          },
        },
      });

      const receivedInvites = await prisma.friendInvite.findMany({
        where: { inviteeId: userId },
        include: {
          inviter: {
            select: { username: true, profilePhoto: true },
          },
        },
      });

      res.status(200).json({ sentInvites, receivedInvites });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    const { inviterId, inviteeId } = req.body;

    if (
      !inviterId ||
      !inviteeId ||
      typeof inviterId !== 'string' ||
      typeof inviteeId !== 'string'
    ) {
      return res.status(400).json({ error: 'Valid Inviter ID and Invitee ID are required' });
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
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    const { inviteId, status } = req.body;

    if (!inviteId || !status || typeof inviteId !== 'string' || typeof status !== 'string') {
      return res.status(400).json({ error: 'Valid Invite ID and status are required' });
    }

    try {
      const updatedInvite = await prisma.friendInvite.update({
        where: { id: inviteId },
        data: { status },
      });

      res.status(200).json(updatedInvite);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
