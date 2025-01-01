import { Telegraf, Context } from 'telegraf';
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);

bot.command('start', async (ctx: Context) => {
  const telegramUser = ctx.from;
  if (!telegramUser) {
    ctx.reply('Error: Unable to get user information.');
    return;
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

  try {
    const userRef = doc(db, 'users', telegramUser.id.toString());
    let userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, {
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
      });
      console.log('New user created:', telegramUser.id);
    } else {
      // Update existing user's information
      await updateDoc(userRef, {
        username: telegramUser.username || userDoc.data()?.username,
        firstName: telegramUser.first_name || userDoc.data()?.firstName,
        lastName: telegramUser.last_name || userDoc.data()?.lastName,
      });
      console.log('Existing user updated:', telegramUser.id);
    }

    const gameUrl = `${process.env.NEXT_PUBLIC_WEBAPP_URL}?start=${telegramUser.id}`;

    // Send welcome message with photo
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

  try {
    const parsedData = JSON.parse(webAppData.data.json());
    const userRef = doc(db, 'users', telegramUser.id.toString());
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      ctx.reply('Error: User not found.');
      return;
    }

    // Update user data based on game actions
    if (parsedData.action === 'tap') {
      await updateDoc(userRef, {
        coins: increment(parsedData.amount)
      });
    } else if (parsedData.action === 'purchase') {
      // Handle purchase logic
      await updateDoc(userRef, {
        coins: increment(-parsedData.cost)
      });
      // Add logic to update shop items or premium items
    } else if (parsedData.action === 'claim') {
      // Handle reward claim logic
      await updateDoc(userRef, {
        coins: increment(parsedData.amount)
      });
    }

    ctx.answerCbQuery('Game data updated successfully!');
  } catch (error) {
    console.error('Error processing web app data:', error);
    ctx.answerCbQuery('An error occurred while processing game data.');
  }
});

export default bot;

