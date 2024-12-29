import { Telegraf, Markup, Context } from 'telegraf';
import prisma from './lib/prisma';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);

bot.command('start', async (ctx: Context) => {
  const telegramUser = ctx.from;
  if (!telegramUser) {
    ctx.reply('Error: Unable to get user information.');
    return;
  }

  const welcomeMessage = `
Welcome *@${telegramUser.username || telegramUser.first_name}*! 🐾🎉

Dive into the exciting world of Baby Cheetah, where crypto gaming meets fun, rewards, and community! 🚀💎 Earn Baby Cheetah Coins $BBCH, complete tasks, and get ready for an upcoming airdrop you won't to miss! 💸

What You Can Do Now:
💰 Earn $BBCH: Play our mining game and start stacking coins.
👥 Invite Friends: Share the game and earn bonus $BBCH for every friend who joins. More friends, more rewards!
🎯 Complete Quests: Take on daily challenges to boost your earnings and unlock exclusive bonuses.

Start earning today and be part of the next big upcoming airdrop. ✨
Stay fast, stay fierce, stay Baby Cheetah! 🌟
`;

  try {
    let user = await prisma.user.findUnique({
      where: { telegramId: telegramUser.id.toString() },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId: telegramUser.id.toString(),
          username: telegramUser.username || `user${telegramUser.id}`,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name,
        },
      });
      console.log('New user created:', user);
    }

    const gameUrl = `${process.env.NEXT_PUBLIC_WEBAPP_URL}?start=${user.telegramId}`;

    // Send welcome message with photo
    await ctx.replyWithPhoto(
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Golden%20Cheetah.jpg-lskB9XxIu4pBhjth9Pm42BIeveRNPq.jpeg',
      },
      {
        caption: welcomeMessage,
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          Markup.button.webApp('Play 🚀', gameUrl),
          Markup.button.url('Join community', 'https://t.me/babycheetahcrypto'),
        ]),
      }
    );
  } catch (error) {
    console.error('Error in /start command:', error);
    ctx.reply('An error occurred while setting up your game. Please try again later.');
  }
});

// Handle game data updates
bot.on('web_app_data', async (ctx) => {
  const telegramUser = ctx.from;
  const webAppData = ctx.webAppData;

  if (!telegramUser || !webAppData) {
    ctx.reply('Error: Unable to process game data.');
    return;
  }

  const data = webAppData.data;

  if (!data) {
    ctx.reply('Error: Unable to process game data.');
    return;
  }

  try {
    const parsedData = JSON.parse(data.text());
    const user = await prisma.user.findUnique({
      where: { telegramId: telegramUser.id.toString() },
    });

    if (!user) {
      ctx.reply('Error: User not found.');
      return;
    }

    // Update user data based on game actions
    if (parsedData.action === 'tap') {
      await prisma.user.update({
        where: { id: user.id },
        data: { coins: user.coins + parsedData.amount },
      });
    } else if (parsedData.action === 'purchase') {
    } else if (parsedData.action === 'claim') {
      // Handle reward claim logic
      await prisma.user.update({
        where: { id: user.id },
        data: { coins: user.coins + parsedData.amount },
      });
    }

    ctx.answerCbQuery('Game data updated successfully!');
  } catch (error) {
    console.error('Error processing web app data:', error);
    ctx.answerCbQuery('An error occurred while processing game data.');
  }
});
// Add centralized database operations
export const dbOperations = {
  // User operations
  getUser: async (telegramId: string) => {
    return await prisma.user.findUnique({ where: { telegramId } });
  },
  createUser: async (userData: any) => {
    return await prisma.user.create({ data: userData });
  },
  updateUser: async (telegramId: string, userData: any) => {
    return await prisma.user.update({ where: { telegramId }, data: userData });
  },

  // Shop operations
  purchaseItem: async (userId: string, itemData: any) => {
    return await prisma.shopItem.create({ data: { ...itemData, userId } });
  },
  getPremiumItems: async (userId: string) => {
    return await prisma.premiumShopItem.findMany({ where: { userId } });
  },

  // Task operations
  getTasks: async (userId: string) => {
    return await prisma.task.findMany({ where: { userId } });
  },
  updateTask: async (taskId: string, taskData: any) => {
    return await prisma.task.update({ where: { id: taskId }, data: taskData });
  },

  // Daily reward operations
  getDailyReward: async (userId: string) => {
    return await prisma.dailyReward.findUnique({ where: { userId } });
  },
  updateDailyReward: async (userId: string, rewardData: any) => {
    return await prisma.dailyReward.upsert({
      where: { userId },
      update: rewardData,
      create: { ...rewardData, userId },
    });
  },

  // Leaderboard operation
  getLeaderboard: async () => {
    return await prisma.user.findMany({
      select: {
        id: true,
        telegramId: true,
        username: true,
        firstName: true,
        lastName: true,
        coins: true,
        profitPerHour: true,
      },
      orderBy: { coins: 'desc' },
      take: 200,
    });
  },

  // Trophy operations
  updateTrophy: async (userId: string, trophyId: string, trophyData: any) => {
    return await prisma.trophy.update({
      where: { id: trophyId, userId },
      data: trophyData,
    });
  },

  // Invite operation
  inviteFriend: async (userId: string, friendId: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        friendsCoins: {
          ...(user.friendsCoins as object),
          [friendId]: 0,
        },
        coins: { increment: 2000 }, // Reward for inviting a friend
      },
    });

    return updatedUser;
  },
};

export default bot;

