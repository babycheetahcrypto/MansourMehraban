import { Telegraf, Markup } from 'telegraf';
import { prisma } from './lib/prisma';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);

bot.command('start', async (ctx) => {
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
    await ctx.reply(welcomeMessage, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([Markup.button.webApp('Play Baby Cheetah', gameUrl)]),
    });
  } catch (error) {
    console.error('Error in /start command:', error);
    ctx.reply('An error occurred while setting up your game. Please try again later.');
  }
});

export default bot;
