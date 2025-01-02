import { Telegraf, Context } from 'telegraf';
import { Message } from 'telegraf/types';
import { adminDb } from './lib/firebase-admin';
import { db } from './lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN is missing from environment variables');
}

if (!process.env.NEXT_PUBLIC_WEBAPP_URL) {
  throw new Error('NEXT_PUBLIC_WEBAPP_URL is missing from environment variables');
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Middleware to log all bot activities
bot.use(async (ctx, next) => {
  const start = Date.now();
  console.log('Bot received update:', {
    type: ctx.updateType,
    from: ctx.from?.id,
    chat: ctx.chat?.id,
  });
  
  await next();
  
  const ms = Date.now() - start;
  console.log('Response time:', `${ms}ms`);
});

// Handle errors globally
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('An error occurred. Please try again in a few moments.').catch(console.error);
});

// Start command handler
bot.command('start', async (ctx: Context) => {
  console.log('Start command received');
  
  try {
    const telegramUser = ctx.from;
    if (!telegramUser) {
      throw new Error('No user data available');
    }

    // Send "typing" action
    await ctx.sendChatAction('typing');

    // Initial response to user
    const initialMessage = await ctx.reply('Loading your game profile...');

    // Prepare user data
    const userRef = doc(db, 'users', telegramUser.id.toString());
    const userDoc = await getDoc(userRef);

    const userData = {
      telegramId: telegramUser.id.toString(),
      username: telegramUser.username || `user${telegramUser.id}`,
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name,
      coins: 0,
      level: 1,
      exp: 0,
      clickPower: 1,
      energy: 2000,
      multiplier: 1,
      profitPerHour: 0,
      boosterCredits: 1,
      unlockedLevels: [1],
      friendsCoins: {},
      pphAccumulated: 0,
      selectedCoinImage: '',
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Create or update user in database
    if (!userDoc.exists()) {
      await setDoc(userRef, userData);
      console.log('Created new user:', telegramUser.id);
    } else {
      await updateDoc(userRef, {
        username: telegramUser.username || userDoc.data()?.username,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        lastActive: new Date().toISOString(),
      });
      console.log('Updated existing user:', telegramUser.id);
    }

    // Delete loading message
    await ctx.telegram.deleteMessage(ctx.chat!.id, initialMessage.message_id).catch(() => {});

    // Prepare game URL
    const gameUrl = `${process.env.NEXT_PUBLIC_WEBAPP_URL}?start=${telegramUser.id}`;

    // Welcome message
    const welcomeMessage = `
Welcome *${telegramUser.first_name}*! 🐾🎉

Dive into the exciting world of Baby Cheetah, where crypto gaming meets fun, rewards, and community! 🚀💎

What You Can Do:
💰 Earn $BBCH coins
👥 Invite friends for bonus rewards
🎯 Complete daily challenges
🎮 Play mini-games

Ready to start your adventure? Click the Play button below! 🌟
`;

    // Send welcome message with photo
    await ctx.replyWithPhoto(
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Golden%20Cheetah.jpg-lskB9XxIu4pBhjth9Pm42BIeveRNPq.jpeg',
        filename: 'welcome.jpg'
      },
      {
        caption: welcomeMessage,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🎮 Play Now',
                web_app: { url: gameUrl }
              }
            ],
            [
              {
                text: '👥 Join Community',
                url: 'https://t.me/babycheetahcrypto'
              }
            ]
          ]
        }
      }
    );

    console.log('Welcome message sent successfully');

  } catch (error) {
    console.error('Error in start command:', error);
    await ctx.reply(
      'Unable to start the game. Please try again or contact support if the issue persists.'
    );
  }
});

// Handle game data updates
bot.on('web_app_data', async (ctx) => {
  try {
    const telegramUser = ctx.from;
    const webAppData = ctx.webAppData;

    if (!telegramUser || !webAppData) {
      throw new Error('Invalid game data or user information');
    }

    const userRef = doc(db, 'users', telegramUser.id.toString());
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const parsedData = JSON.parse(webAppData.data.json());
    
    switch (parsedData.action) {
      case 'tap':
        await updateDoc(userRef, {
          coins: increment(parsedData.amount),
          lastActive: new Date().toISOString()
        });
        break;
      case 'purchase':
        await updateDoc(userRef, {
          coins: increment(-parsedData.cost),
          lastActive: new Date().toISOString()
        });
        break;
      case 'claim':
        await updateDoc(userRef, {
          coins: increment(parsedData.amount),
          lastActive: new Date().toISOString()
        });
        break;
      default:
        throw new Error('Invalid game action');
    }

    await ctx.answerCbQuery('Game data updated successfully!');
  } catch (error) {
    console.error('Error processing game data:', error);
    await ctx.answerCbQuery('Failed to update game data. Please try again.');
  }
});

// Set webhook if URL is provided
if (process.env.WEBHOOK_URL) {
  bot.telegram.setWebhook(process.env.WEBHOOK_URL).then(() => {
    console.log('Webhook set successfully');
  }).catch((error) => {
    console.error('Failed to set webhook:', error);
  });
}

export default bot;

