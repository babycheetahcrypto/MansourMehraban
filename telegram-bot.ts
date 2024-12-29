import { Telegraf, Markup, Context } from 'telegraf';
import axios from 'axios';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

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
    const response = await axios.post(`${API_BASE_URL}/user`, {
      telegramId: telegramUser.id.toString(),
      username: telegramUser.username || `user${telegramUser.id}`,
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name,
    });

    const user = response.data;
    console.log('User created or updated:', user);

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
    
    const response = await axios.patch(`${API_BASE_URL}/user/${telegramUser.id}`, parsedData);
    
    if (response.status === 200) {
      ctx.answerCbQuery('Game data updated successfully!');
    } else {
      throw new Error('Failed to update game data');
    }
  } catch (error) {
    console.error('Error processing web app data:', error);
    ctx.answerCbQuery('An error occurred while processing game data.');
  }
});

export default bot;