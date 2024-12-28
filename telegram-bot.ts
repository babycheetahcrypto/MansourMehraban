import { Telegraf, Markup, Context } from 'telegraf';
import { PrismaClient } from '@prisma/client'
import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';

const prisma = new PrismaClient()
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);
const app = express();

app.use(bodyParser.json());

// Helper function to wrap async route handlers
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// User API
app.post('/api/user', asyncHandler(async (req: Request, res: Response) => {
  const { telegramId, username, firstName, lastName } = req.body;

  try {
    let user = await prisma.user.findUnique({
      where: { telegramId: telegramId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId,
          username,
          firstName,
          lastName,
          profilePhoto: '',
          selectedCoinImage: '',
          coins: 0,
          level: 1,
          exp: 0,
          unlockedLevels: [1],
          clickPower: 1,
          friendsCoins: {},
          energy: 2000,
          pphAccumulated: 0,
          multiplier: 1,
          profitPerHour: 0,
          boosterCredits: 1,
        },
      });
      console.log('New user created:', user);
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({ error: 'An error occurred while creating/updating the user.' });
  }
}));

// Daily Reward API
app.get('/api/daily-reward', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const dailyReward = await prisma.dailyReward.findUnique({
      where: { userId: userId as string },
    });

    res.status(200).json(dailyReward);
  } catch (error) {
    console.error('Failed to fetch daily reward data:', error);
    res.status(500).json({ error: 'Failed to fetch daily reward data' });
  }
}));

app.patch('/api/daily-reward', asyncHandler(async (req: Request, res: Response) => {
  const { userId, lastClaimed, streak, day, completed } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const updatedDailyReward = await prisma.dailyReward.upsert({
      where: { userId: userId as string },
      update: { lastClaimed, streak, day, completed },
      create: { userId: userId as string, lastClaimed, streak, day, completed },
    });

    res.status(200).json(updatedDailyReward);
  } catch (error) {
    console.error('Failed to update daily reward data:', error);
    res.status(500).json({ error: 'Failed to update daily reward data' });
  }
}));

// Tasks API
app.post('/api/tasks', asyncHandler(async (req: Request, res: Response) => {
  const { userId, taskData } = req.body;
  try {
    const task = await prisma.task.create({
      data: {
        ...taskData,
        userId: userId,
      },
    });
    res.status(200).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
}));

app.get('/api/tasks', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.query;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId: userId as string,
      },
    });
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}));

app.put('/api/tasks/:taskId', asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { userId, taskData } = req.body;
  try {
    const task = await prisma.task.update({
      data: {
        ...taskData,
      },
      where: {
        id: taskId,
        userId: userId,
      },
    });
    res.status(200).json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
}));

app.delete('/api/tasks/:taskId', asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { userId } = req.query;
  try {
    const task = await prisma.task.delete({
      where: {
        id: taskId,
        userId: userId as string,
      },
    });
    res.status(200).json(task);
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
}));

// Leaderboard API
app.get('/api/leaderboard', asyncHandler(async (req: Request, res: Response) => {
  try {
    const leaderboard = await prisma.user.findMany({
      select: {
        id: true,
        telegramId: true,
        username: true,
        firstName: true,
        lastName: true,
        coins: true,
        profitPerHour: true,
      },
      orderBy: {
        coins: 'desc',
      },
      take: 200,
    });

    const leaderboardWithRanks = leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    res.status(200).json(leaderboardWithRanks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
}));

// Invite API
app.post('/api/invite', asyncHandler(async (req: Request, res: Response) => {
  const { userId, friendId } = req.body;

  if (!userId || !friendId) {
    return res.status(400).json({ error: 'User ID and Friend ID are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user's friendsCoins
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        friendsCoins: {
          ...(user.friendsCoins as object),
          [friendId]: 0,
        },
      },
    });

    // Add coins to the user for inviting a friend
    const inviteReward = 2000;
    await prisma.user.update({
      where: { id: userId },
      data: {
        coins: {
          increment: inviteReward,
        },
      },
    });

    res.status(200).json({ message: 'Friend invited successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process invitation' });
  }
}));

// Trophies API
app.put('/api/trophies/:trophyId', asyncHandler(async (req: Request, res: Response) => {
  const { trophyId } = req.params;
  const { userId, data } = req.body;
  try {
    const updatedTrophy = await prisma.trophy.update({
      data,
      where: {
        id: trophyId,
        userId: userId,
      },
    });
    res.status(200).json(updatedTrophy);
  } catch (error) {
    console.error("Error updating trophy:", error);
    res.status(500).json({ error: 'Failed to update trophy' });
  }
}));

app.get('/api/trophies/:trophyId', asyncHandler(async (req: Request, res: Response) => {
  const { trophyId } = req.params;
  const { userId } = req.query;
  try {
    const trophy = await prisma.trophy.findUnique({
      where: {
        id: trophyId,
        userId: userId as string,
      },
    });
    res.status(200).json(trophy);
  } catch (error) {
    console.error("Error getting trophy:", error);
    res.status(500).json({ error: 'Failed to get trophy' });
  }
}));

// Level API
app.get('/api/level', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Valid User ID is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { level: true, exp: true, unlockedLevels: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}));

app.put('/api/level', asyncHandler(async (req: Request, res: Response) => {
  const { userId, level, exp, unlockedLevels } = req.body;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Valid User ID is required' });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        level: level !== undefined ? level : undefined,
        exp: exp !== undefined ? exp : undefined,
        unlockedLevels: unlockedLevels !== undefined ? unlockedLevels : undefined,
      },
      select: { level: true, exp: true, unlockedLevels: true },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}));

// Shop API
app.post('/api/shop/purchase', asyncHandler(async (req: Request, res: Response) => {
  const { userId, itemName, itemImage, itemPrice, isPremium, itemEffect, itemProfit } = req.body;
  try {
    let purchasedItem;

    if (isPremium) {
      purchasedItem = await prisma.premiumShopItem.create({
        data: {
          user: { connect: { id: userId } },
          name: itemName,
          image: itemImage,
          basePrice: itemPrice,
          effect: itemEffect || '',
        },
      });
    } else {
      purchasedItem = await prisma.shopItem.create({
        data: {
          user: { connect: { id: userId } },
          name: itemName,
          image: itemImage,
          basePrice: itemPrice,
          baseProfit: itemProfit || 0,
          level: 1,
        },
      });
    }

    res.status(200).json(purchasedItem);
  } catch (error) {
    console.error('Error purchasing item:', error);
    res.status(500).json({ error: 'Failed to purchase item' });
  }
}));

// Telegram bot commands
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
    await prisma.$disconnect();
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
        data: { coins: { increment: parsedData.amount } },
      });
    } else if (parsedData.action === 'purchase') {
      // Implement purchase logic here
      // This could involve deducting coins and adding the purchased item to the user's inventory
    } else if (parsedData.action === 'claim') {
      // Handle reward claim logic
      await prisma.user.update({
        where: { id: user.id },
        data: { coins: { increment: parsedData.amount } },
      });
    }

    ctx.answerCbQuery('Game data updated successfully!');
  } catch (error) {
    console.error('Error processing web app data:', error);
    ctx.answerCbQuery('An error occurred while processing game data.');
  }
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default bot;

