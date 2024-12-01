import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      const sentInvites = await prisma.friendInvite.findMany({
        where: { inviterId: userId as string },
        include: {
          invitee: {
            select: { username: true, profilePhoto: true },
          },
        },
      });

      const receivedInvites = await prisma.friendInvite.findMany({
        where: { inviteeId: userId as string },
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
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    const { inviteId, status } = req.body;

    if (!inviteId || !status) {
      return res.status(400).json({ error: 'Invite ID and status are required' });
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
