import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, friendId } = req.body;

    if (!userId || !friendId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if the friend is a new user
    const friend = await prisma.user.findUnique({
      where: { telegramId: friendId },
    });

    if (friend) {
      return res.status(400).json({ message: 'User has already joined the game' });
    }

    // Create a new user account for the invited friend
    const newFriend = await prisma.user.create({
      data: {
        telegramId: friendId,
        username: `user_${friendId}`, // Generate a default username
        coins: 0,
        level: 1,
        exp: 0,
        profilePhoto: '', // Add an empty string for profilePhoto
        clickPower: 1,
        energy: 500,
        multiplier: 1,
        profitPerHour: 0,
        settings: JSON.stringify({
          vibration: true,
          backgroundMusic: false,
          soundEffect: true,
        }),
      },
    });

    // Create a friend invite record
    await prisma.friendInvite.create({
      data: {
        inviterId: userId,
        inviteeId: newFriend.id,
        status: 'ACCEPTED', // Since the new user is created, we can set the status as accepted
      },
    });

    // Award coins to the inviter
    await prisma.user.update({
      where: { telegramId: userId },
      data: {
        coins: { increment: 1000 },
      },
    });

    // Create a referral reward for the inviter
    await prisma.referralReward.create({
      data: {
        userId: userId,
        referredId: newFriend.id,
        amount: 1000,
        claimed: true,
        claimedAt: new Date(),
      },
    });

    return res.status(200).json({ message: 'Invitation processed successfully' });
  } catch (error) {
    console.error('Error processing invitation:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
