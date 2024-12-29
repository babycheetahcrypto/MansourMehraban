import { Telegraf, Markup, Context } from 'telegraf';
import prisma from './lib/prisma';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);

function logEnvironmentVariables() {
  console.log('Environment variables:');
  console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log('NEXT_PUBLIC_WEBAPP_URL:', process.env.NEXT_PUBLIC_WEBAPP_URL);
  console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'Set' : 'Not set');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
}

logEnvironmentVariables();

if (!process.env.NEXT_PUBLIC_API_URL || !process.env.NEXT_PUBLIC_WEBAPP_URL || !process.env.TELEGRAM_BOT_TOKEN || !process.env.DATABASE_URL) {
  console.error('One or more required environment variables are not set. Please check your configuration.');
  process.exit(1);
}

async function checkApiHealth() {
  try {
    console.log(`Checking API health at: ${process.env.NEXT_PUBLIC_API_URL}/api/health`);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`, { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('API health check response status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('API health check successful:', data);
      return data.status === 'OK';
    } else {
      const errorText = await response.text();
      console.error('API health check failed. Status:', response.status, 'Response:', errorText);
      return false;
    }
  } catch (error) {
    console.error('API health check error:', error);
    return false;
  }
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  try {
    console.log(`Fetching: ${url}`);
    const response = await fetch(url, options);
    console.log(`Fetch response status: ${response.status}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    console.error(`Fetch error: ${error}`);
    if (retries > 0) {
      console.log(`Retrying fetch to ${url}. Attempts left: ${retries - 1}`);
      return fetchWithRetry(url, options, retries - 1);
    } else {
      throw error;
    }
  }
}

bot.command('start', async (ctx: Context) => {
  console.log('Start command received');
  const telegramUser = ctx.from;
  if (!telegramUser) {
    console.error('Error: Unable to get user information.');
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
    console.log('Checking API health...');
    const isHealthy = await checkApiHealth();
    if (!isHealthy) {
      console.error('API health check failed. Game is unavailable.');
      ctx.reply('Sorry, the game is currently unavailable. Please try again later.');
      return;
    }

    console.log(`Fetching user data for Telegram ID: ${telegramUser.id}`);
    console.log(`API URL: ${process.env.NEXT_PUBLIC_API_URL}`);
    
    const response = await fetchWithRetry(`${process.env.NEXT_PUBLIC_API_URL}/api/user?telegramId=${telegramUser.id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    let user;

    if (response.ok) {
      user = await response.json();
      console.log('User data fetched successfully:', user);
    } else if (response.status === 404) {
      console.log('User not found, creating new user');
      const createResponse = await fetchWithRetry(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: telegramUser.id.toString(),
          username: telegramUser.username || `user${telegramUser.id}`,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name,
        }),
      });

      if (createResponse.ok) {
        user = await createResponse.json();
        console.log('New user created:', user);
      } else {
        const errorText = await createResponse.text();
        console.error('Failed to create new user:', errorText);
        throw new Error(`Failed to create new user: ${errorText}`);
      }
    } else {
      const errorText = await response.text();
      console.error('Failed to fetch or create user:', errorText);
      throw new Error(`Failed to fetch or create user: ${errorText}`);
    }

    const gameUrl = `${process.env.NEXT_PUBLIC_WEBAPP_URL}?start=${user.telegramId}`;

    console.log('Sending welcome message');
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
    console.log('Welcome message sent successfully');
  } catch (error) {
    console.error('Error in /start command:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    ctx.reply(`An error occurred while setting up your game. Please try again later. Error details: ${errorMessage}`);
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
    const response = await fetchWithRetry(`${process.env.NEXT_PUBLIC_API_URL}/api/user?telegramId=${telegramUser.id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const user = await response.json();

    // Update user data based on game actions
    if (parsedData.action === 'tap' || parsedData.action === 'claim') {
      const updateResponse = await fetchWithRetry(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: user.telegramId,
          coins: user.coins + parsedData.amount,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update user data');
      }
    } else if (parsedData.action === 'purchase') {
      // Handle purchase logic here
    }

    ctx.answerCbQuery('Game data updated successfully!');
  } catch (error) {
    console.error('Error processing web app data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    ctx.answerCbQuery(`An error occurred while processing game data. Details: ${errorMessage}`);
  }
});

export default bot;

