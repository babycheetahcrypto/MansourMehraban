import { Telegraf, Markup, Context } from 'telegraf';
import { prisma } from './lib/prisma';
import { User, Prisma } from '@prisma/client';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);

bot.command('start', async (ctx: Context) => {
  const telegramUser = ctx.from;
  if (!telegramUser) {
    ctx.reply('Error: Unable to get user information.');
    return;
  }

  const welcomeMessage = `
Welcome to Baby Cheetah! 🎉🎉🎉

At Baby Cheetah, we're redefining crypto 
gaming with exciting tap-to-earn mechanics,
social engagement, and exclusive rewards. 
Collect Baby Cheetah Coins $BBCH, complete 
tasks, and preparefor something big—an 
airdrop is coming soon! 🚀💸

🥊 Here's what you can do with Baby
Cheetah 🐾 now:
💰 Earn Baby Cheetah Coins: Tap, play, and 
collect $BBCH in our fun and Mining game.
👥 Invite Friends: Share the game 
and earn more $BBCH with every friend who
 joins! More friends = more rewards.
🎯 Complete Daily Quests: Take on challenges
 to boost your earnings and unlock special bonuses.

Start earning Baby Cheetah Coins today, and
get ready for amazing rewards that are just 
around the corner! 🐆

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
          profilePhoto: '',
          coins: 0,
          level: 1,
          exp: 0,
          unlockedLevels: [1],
          clickPower: 1,
          friendsCoins: {},
          energy: 500,
          pphAccumulated: 0,
          multiplier: 1,
          settings: { vibration: true, backgroundMusic: false, soundEffect: true },
          profitPerHour: 0,
        },
      });
      console.log('New user created:', user);
    }

    const gameUrl = `${process.env.NEXT_PUBLIC_WEBAPP_URL}?start=${user.telegramId}`;

    // Send welcome message with photo
    await ctx.replyWithPhoto(
      {
        url: 'https://i.postimg.cc/dv4DjYdW/Albedo-Base-XL-make-a-baby-cheetah-cheetah-with-wears-cloths-ho-3.jpg',
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

    switch (parsedData.action) {
      case 'tap':
        await updateUserData(user.telegramId, { coins: { increment: parsedData.amount } });
        break;
      case 'purchase':
        // Handle purchase logic
        break;
      case 'claim':
        await updateUserData(user.telegramId, { coins: { increment: parsedData.amount } });
        break;
      case 'updateLevel':
        await updateUserData(user.telegramId, {
          level: parsedData.level,
          exp: parsedData.exp,
          unlockedLevels: parsedData.unlockedLevels,
        });
        break;
      case 'completeTask':
        await prisma.task.update({
          where: { id: parsedData.taskId },
          data: { progress: parsedData.progress, completed: parsedData.completed },
        });
        break;
      case 'claimTrophy':
        await prisma.trophy.update({
          where: { id: parsedData.trophyId },
          data: { claimed: true, unlockedAt: new Date() },
        });
        break;
      default:
        console.log('Unknown action:', parsedData.action);
    }

    ctx.answerCbQuery('Game data updated successfully!');
  } catch (error) {
    console.error('Error processing web app data:', error);
    ctx.answerCbQuery('An error occurred while processing game data.');
  }
});

// API connection functions
async function updateUserData(telegramId: string, data: Prisma.UserUpdateInput) {
  try {
    const updatedUser = await prisma.user.update({
      where: { telegramId },
      data: {
        ...data,
        friendsCoins: data.friendsCoins ? JSON.parse(JSON.stringify(data.friendsCoins)) : undefined,
        settings: data.settings ? JSON.parse(JSON.stringify(data.settings)) : undefined,
      },
      include: {
        shopItems: true,
        premiumShopItems: true,
        tasks: true,
        dailyReward: true,
        trophies: true,
        referralRewards: true,
      },
    });
    return updatedUser;
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
}

async function getLeaderboard() {
  try {
    const leaderboard = await prisma.user.findMany({
      select: {
        id: true,
        telegramId: true,
        username: true,
        coins: true,
        profitPerHour: true,
      },
      orderBy: {
        coins: 'desc',
      },
      take: 100,
    });
    return leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
}

async function getDailyReward(userId: string) {
  try {
    const dailyReward = await prisma.dailyReward.findUnique({
      where: { userId },
    });
    return dailyReward;
  } catch (error) {
    console.error('Error fetching daily reward:', error);
    throw error;
  }
}

async function getFriendsActivity(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { friendsCoins: true },
    });
    return user?.friendsCoins || {};
  } catch (error) {
    console.error('Error fetching friends activity:', error);
    throw error;
  }
}

async function getReferralRewards(userId: string) {
  try {
    const referralRewards = await prisma.referralReward.findMany({
      where: { userId },
    });
    return referralRewards;
  } catch (error) {
    console.error('Error fetching referral rewards:', error);
    throw error;
  }
}

async function createInvite(inviterId: string, inviteeId: string) {
  try {
    const invite = await prisma.friendInvite.create({
      data: {
        inviterId,
        inviteeId,
        status: 'pending',
      },
    });
    return invite;
  } catch (error) {
    console.error('Error creating invite:', error);
    throw error;
  }
}

async function getShopItems() {
  try {
    const shopItems = await prisma.shopItem.findMany();
    const premiumShopItems = await prisma.premiumShopItem.findMany();
    return { shopItems, premiumShopItems };
  } catch (error) {
    console.error('Error fetching shop items:', error);
    throw error;
  }
}

async function getTrophies(userId: string) {
  try {
    const trophies = await prisma.trophy.findMany({
      where: { userId },
    });
    return trophies;
  } catch (error) {
    console.error('Error fetching trophies:', error);
    throw error;
  }
}

async function getUserLevel(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { level: true, exp: true, unlockedLevels: true },
    });
    return user;
  } catch (error) {
    console.error('Error fetching user level:', error);
    throw error;
  }
}

async function getTasks(userId: string) {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId },
    });
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}

// Add more API connection functions for other endpoints as needed

export default bot;
