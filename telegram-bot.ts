import { Telegraf, Context } from 'telegraf';
import { app, db } from './firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

// Add debug logging
const debugLog = (message: string, data?: any) => {
  console.log(`[DEBUG] ${message}`, data || '');
};

// Validate environment variables
const requiredEnvVars = [
  'TELEGRAM_BOT_TOKEN',
  'NEXT_PUBLIC_WEBAPP_URL',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);

// Add error handler with detailed logging
bot.catch((err: any, ctx: Context) => {
  console.error('[BOT ERROR]', {
    error: err,
    update: ctx.update,
    userData: ctx.from
  });
  ctx.reply('An error occurred. Our team has been notified.').catch(console.error);
});

bot.command('start', async (ctx: Context) => {
  debugLog('Start command received', { from: ctx.from });

  try {
    const telegramUser = ctx.from;
    if (!telegramUser) {
      throw new Error('Unable to get user information');
    }

    debugLog('Processing user', telegramUser);

    // Split the welcome message for better reliability
    const welcomeMessage = `Welcome *@${telegramUser.username || telegramUser.first_name}*! 🐾🎉\n\nDive into the exciting world of Baby Cheetah!`;
    
    // Send initial message first
    await ctx.reply(welcomeMessage, { parse_mode: 'Markdown' });
    debugLog('Sent initial welcome message');

    const fullWelcomeMessage = `
🚀💎 Earn Baby Cheetah Coins $BBCH, complete tasks, and get ready for an upcoming airdrop you won't want to miss! 💸

What You Can Do Now:
💰 Earn $BBCH: Play our mining game and start stacking coins.
👥 Invite Friends: Share the game and earn bonus $BBCH for every friend who joins.
🎯 Complete Quests: Take on daily challenges to boost your earnings.

Start earning today and be part of the next big upcoming airdrop. ✨
Stay fast, stay fierce, stay Baby Cheetah! 🌟`;

    debugLog('Initializing Firebase user data');

    const userRef = doc(db, 'users', telegramUser.id.toString());
    
    try {
      const user = await getDoc(userRef);
      debugLog('Firebase user fetch result', { exists: user.exists() });

      const defaultUserData = {
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
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };

      if (!user.exists()) {
        await setDoc(userRef, defaultUserData);
        debugLog('Created new user');
      } else {
        await updateDoc(userRef, {
          username: telegramUser.username || user.data()?.username,
          firstName: telegramUser.first_name || user.data()?.firstName,
          lastName: telegramUser.last_name || user.data()?.lastName,
          lastActive: new Date().toISOString()
        });
        debugLog('Updated existing user');
      }

      const gameUrl = `${process.env.NEXT_PUBLIC_WEBAPP_URL}?start=${telegramUser.id}`;
      debugLog('Game URL generated', gameUrl);

      // Send photo and buttons separately for better reliability
      try {
        await ctx.replyWithPhoto(
          {
            url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Golden%20Cheetah.jpg-lskB9XxIu4pBhjth9Pm42BIeveRNPq.jpeg'
          },
          {
            caption: fullWelcomeMessage,
            parse_mode: 'Markdown'
          }
        );
        debugLog('Sent photo message');

        // Send buttons in a separate message
        await ctx.reply('Choose an action:', {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Play 🚀', web_app: { url: gameUrl } }],
              [{ text: 'Join community', url: 'https://t.me/babycheetahcrypto' }]
            ]
          }
        });
        debugLog('Sent action buttons');

      } catch (photoError) {
        console.error('Error sending photo:', photoError);
        // Fallback to text-only messages
        await ctx.reply(fullWelcomeMessage, { parse_mode: 'Markdown' });
        await ctx.reply('Choose an action:', {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Play 🚀', web_app: { url: gameUrl } }],
              [{ text: 'Join community', url: 'https://t.me/babycheetahcrypto' }]
            ]
          }
        });
        debugLog('Sent fallback text messages');
      }

    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      throw new Error('Failed to process user data');
    }

  } catch (error) {
    console.error('Error in /start command:', error);
    // Send a more detailed error message
    await ctx.reply(
      'Unable to start the game. Please try these steps:\n' +
      '1. Make sure you have a username set in Telegram\n' +
      '2. Try the /start command again\n' +
      '3. If the problem persists, contact our support'
    );
  }
});

// Improved web_app_data handler
bot.on('web_app_data', async (ctx) => {
  debugLog('Received web_app_data');
  
  try {
    const telegramUser = ctx.from;
    const webAppData = ctx.webAppData;

    if (!telegramUser || !webAppData) {
      throw new Error('Invalid game data or user information');
    }

    debugLog('Processing web app data', { userId: telegramUser.id });

    const userRef = doc(db, 'users', telegramUser.id.toString());
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found in database');
    }

    const parsedData = JSON.parse(webAppData.data.json());
    debugLog('Parsed web app data', parsedData);

    switch (parsedData.action) {
      case 'tap':
        await updateDoc(userRef, {
          coins: increment(parsedData.amount),
          lastActive: new Date().toISOString()
        });
        debugLog('Updated tap action');
        break;
      case 'purchase':
        await updateDoc(userRef, {
          coins: increment(-parsedData.cost),
          lastActive: new Date().toISOString()
        });
        debugLog('Updated purchase action');
        break;
      case 'claim':
        await updateDoc(userRef, {
          coins: increment(parsedData.amount),
          lastActive: new Date().toISOString()
        });
        debugLog('Updated claim action');
        break;
      default:
        throw new Error(`Invalid game action: ${parsedData.action}`);
    }

    await ctx.answerCbQuery('Game data updated successfully!');
  } catch (error) {
    console.error('Error processing web app data:', error);
    await ctx.answerCbQuery('Failed to update game data. Please try again.');
  }
});

// Add middleware to log all updates
bot.use((ctx, next) => {
  debugLog('Received update', { 
    updateType: ctx.updateType,
    from: ctx.from
  });
  return next();
});

// Initialize bot with proper error handling
const initBot = async () => {
  try {
    debugLog('Starting bot...');
    await bot.launch();
    console.log('Bot successfully started!');
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
};

// Start the bot
initBot();

// Enable graceful stop
process.once('SIGINT', () => {
  debugLog('Received SIGINT');
  bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
  debugLog('Received SIGTERM');
  bot.stop('SIGTERM');
});

export default bot;

