import { Telegraf, Context } from 'telegraf';
import { app, db } from './firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

// Add error checking for bot token
if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN is not set in environment variables');
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Add error handler
bot.catch((err: any, ctx: Context) => {
  console.error('Bot error:', err);
  ctx.reply('An error occurred. Our team has been notified.');
});

bot.command('start', async (ctx: Context) => {
  try {
    const telegramUser = ctx.from;
    if (!telegramUser) {
      throw new Error('Unable to get user information');
    }

    // Validate required environment variables
    if (!process.env.NEXT_PUBLIC_WEBAPP_URL) {
      throw new Error('NEXT_PUBLIC_WEBAPP_URL is not set');
    }

    const welcomeMessage = `
Welcome *@${telegramUser.username || telegramUser.first_name}*! 🐾🎉

Dive into the exciting world of Baby Cheetah, where crypto gaming meets fun, rewards, and community! 🚀💎 Earn Baby Cheetah Coins $BBCH, complete tasks, and get ready for an upcoming airdrop you won't want to miss! 💸

What You Can Do Now:
💰 Earn $BBCH: Play our mining game and start stacking coins.
👥 Invite Friends: Share the game and earn bonus $BBCH for every friend who joins. More friends, more rewards!
🎯 Complete Quests: Take on daily challenges to boost your earnings and unlock exclusive bonuses.

Start earning today and be part of the next big upcoming airdrop. ✨
Stay fast, stay fierce, stay Baby Cheetah! 🌟
`;

    const userRef = doc(db, 'users', telegramUser.id.toString());
    const user = await getDoc(userRef);

    // Initialize default user data
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
      dailyReward: {
        lastClaimed: null,
        streak: 0,
        day: 1,
        completed: false
      },
      shopItems: [],
      premiumShopItems: [],
      tasks: [],
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    if (!user.exists()) {
      await setDoc(userRef, defaultUserData);
      console.log('New user created:', telegramUser.id);
    } else {
      // Update existing user's information while preserving their data
      const userData = user.data();
      await updateDoc(userRef, {
        username: telegramUser.username || userData.username,
        firstName: telegramUser.first_name || userData.firstName,
        lastName: telegramUser.last_name || userData.lastName,
        lastActive: new Date().toISOString()
      });
      console.log('Existing user updated:', telegramUser.id);
    }

    const gameUrl = `${process.env.NEXT_PUBLIC_WEBAPP_URL}?start=${telegramUser.id}`;

    // Send welcome message with photo and error handling
    try {
      await ctx.replyWithPhoto(
        {
          url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Golden%20Cheetah.jpg-lskB9XxIu4pBhjth9Pm42BIeveRNPq.jpeg',
        },
        {
          caption: welcomeMessage,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Play 🚀', web_app: { url: gameUrl } }],
              [{ text: 'Join community', url: 'https://t.me/babycheetahcrypto' }],
            ],
          },
        }
      );
    } catch (photoError) {
      console.error('Error sending photo:', photoError);
      // Fallback to text-only message if photo fails
      await ctx.reply(welcomeMessage, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Play 🚀', web_app: { url: gameUrl } }],
            [{ text: 'Join community', url: 'https://t.me/babycheetahcrypto' }],
          ],
        },
      });
    }
  } catch (error) {
    console.error('Error in /start command:', error);
    ctx.reply('An error occurred while setting up your game. Please try again in a few minutes. If the problem persists, contact our support.');
  }
});

// Handle game data updates with improved error handling
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
      throw new Error('User not found in database');
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
    console.error('Error processing web app data:', error);
    await ctx.answerCbQuery('Failed to update game data. Please try again.');
  }
});

// Add launch error handling
bot.launch().catch((err) => {
  console.error('Failed to launch bot:', err);
  process.exit(1);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export default bot;

