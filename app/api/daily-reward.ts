import { db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { User } from '../../types/user';

export async function claimDailyReward(userId: string): Promise<{ success: boolean; message: string; reward?: number }> {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    return { success: false, message: 'User not found' };
  }

  const userData = userDoc.data() as User;
  const now = new Date();
  const lastClaimed = userData.dailyReward.lastClaimed ? new Date(userData.dailyReward.lastClaimed) : null;

  if (lastClaimed && lastClaimed.toDateString() === now.toDateString()) {
    return { success: false, message: 'Daily reward already claimed today' };
  }

  // Calculate streak and reward
  let streak = userData.dailyReward.streak;
  let day = userData.dailyReward.day;

  if (!lastClaimed || now.getTime() - lastClaimed.getTime() > 24 * 60 * 60 * 1000) {
    streak = 1;
    day = 1;
  } else {
    streak++;
    day = (day % 7) + 1;
  }

  const reward = calculateReward(day);

  // Update user data
  await updateDoc(userRef, {
    coins: userData.coins + reward,
    'dailyReward.lastClaimed': now,
    'dailyReward.streak': streak,
    'dailyReward.day': day,
    'dailyReward.completed': true,
  });

  return { success: true, message: `Claimed daily reward: ${reward} coins`, reward };
}

function calculateReward(day: number): number {
  // Implement your reward calculation logic here
  const baseReward = 100;
  return baseReward * day;
}

