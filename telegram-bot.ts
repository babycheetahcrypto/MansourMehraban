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
🎉 Welcome to Baby Cheetah Crypto Game! 🐆💰

Get ready for an exciting adventure in the world of crypto mining! Here's what you can expect:

🔹 Mine virtual coins by tapping
🔹 Upgrade your mining equipment
🔹 Complete tasks for extra rewards
🔹 Compete with friends on the leaderboard
🔹 Earn daily rewards and special bonuses

Are you ready to become a crypto tycoon? Click the "Play" button below to start your journey!

Remember, this is a fun game and does not involve real cryptocurrency or money. Enjoy and happy mining! 🚀
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
          profilePhoto: telegramUser.photo_url || '',
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
          Markup.button.webApp('Play Baby Cheetah', gameUrl),
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
