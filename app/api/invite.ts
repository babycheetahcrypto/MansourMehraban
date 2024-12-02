import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { inviterId, inviteeId } = req.body;
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
      res.status(400).json({ error: 'Failed to create invite' });
    }
  } else if (req.method === 'GET') {
    const { userId } = req.query;
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
      res.status(400).json({ error: 'Failed to fetch invites' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
