import { Telegraf, Markup, Context } from 'telegraf';
import { prisma } from './lib/prisma';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);

bot.command('start', async (ctx: Context) => {
  const telegramUser = ctx.from;
  if (!telegramUser) {
    ctx.reply('Error: Unable to get user information.');
    return;
  }

  const welcomeMessage = `
Welcome to Baby Cheetah! 🎉🐾

Step into the exciting world of Baby Cheetah, where we’re revolutionizing crypto gaming with fun tap-to-earn mechanics, social interactions, and exclusive rewards. 🕹️💎

Get ready to collect $BBCH Coins, complete tasks, and prepare for something BIG—a massive airdrop is just around the corner! 🚀💸

Here’s what you can do with Baby Cheetah NOW:
🐾 Earn Baby Cheetah Coins ($BBCH): Tap, play, and collect rewards in our thrilling mining game. 💰
🐾 Invite Your Friends: Share the fun! Earn even more $BBCH for every friend who joins the adventure. More friends = bigger rewards. 👥✨
🐾 Complete Daily Quests: Take on challenges, boost your earnings, and unlock exclusive bonuses to maximize your rewards. 🎯🎁

Why wait? Start earning today!
🟡 Tap. Play. Earn.
🟡 Prepare for the airdrop.
🟡 Stay fast. Stay fierce. Stay Baby Cheetah! 🌟

Join the movement and start your Baby Cheetah journey today! 🐆🔥
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
          multiplierEndTime: null,
          boosterCooldown: null,
          settings: {
            vibration: true,
            backgroundMusic: false,
            soundEffect: true,
          },
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
export default bot;
