import { Telegraf, Markup, Context } from 'telegraf';
import { prisma } from './lib/prisma';
import { User } from '@/types/user';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);

bot.command('start', async (ctx: Context) => {
  const telegramUser = ctx.from;
  if (!telegramUser) {
    ctx.reply('Error: Unable to get user information.');
    return;
  }

  const welcomeMessage = `
Welcome to Baby Cheetah! 🎉🎉🎉

At Baby Cheetah, we’re redefining 
crypto gaming with exciting tap-to-earn
 mechanics, social engagement, and 
exclusive rewards. Collect Baby Cheetah 
Coins $BBCH, complete tasks, and prepare
for something big—an airdrop is coming soon! 🚀💸

Here’s what you can do with Baby Cheetah now:
💰 Earn Baby Cheetah Coins: Tap, play, and 
collect $BBCH in our fun and Mining game.
👥 Invite Friends: Share the game 
and earn more $BBCH with every friend who
 joins! More friends = more rewards.
🎯 Complete Daily Quests: Take on challenges
 to boost your earnings and unlock special bonuses.

Start earning Baby Cheetah Coins today, and get ready 
for amazing rewards that are just around the corner! 🐆

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
          Markup.button.url('Join Our Channel', 'https://t.me/babycheetahcrypto'),
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

// API connection functions
async function updateUserData(telegramId: string, data: Partial<User>) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegramId, ...data }),
    });
    if (!response.ok) throw new Error('Failed to update user data');
    return await response.json();
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
}

async function getLeaderboard() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leaderboard`);
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return await response.json();
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
}

async function getDailyReward(userId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/daily-reward?userId=${userId}`
    );
    if (!response.ok) throw new Error('Failed to fetch daily reward');
    return await response.json();
  } catch (error) {
    console.error('Error fetching daily reward:', error);
    throw error;
  }
}

// Add more API connection functions for other endpoints as needed

export default bot;
