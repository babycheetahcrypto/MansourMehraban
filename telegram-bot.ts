import { Telegraf, Context } from 'telegraf';
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment, Firestore } from 'firebase/firestore';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

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

let app: FirebaseApp;
let db: Firestore;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);

bot.command('start', async (ctx: Context) => {
  const telegramUser = ctx.from;
  if (!telegramUser) {
    console.error('Error: Unable to get user information.');
    ctx.reply('Error: Unable to get user information. Please try again.');
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
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const userRef = doc(db, 'users', telegramUser.id.toString());
    let userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        telegramId: telegramUser.id.toString(),
        username: telegramUser.username || `user${telegramUser.id}`,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
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
    ctx.reply('An error occurred while setting up your game. Please try again later. Error details: ' + (error instanceof Error ? error.message : String(error)));
  }
});

// Handle game data updates
bot.on('web_app_data', async (ctx) => {
  const telegramUser = ctx.from;
  const webAppData = ctx.webAppData;

  if (!telegramUser || !webAppData) {
    console.error('Error: Unable to process game data. Missing user or web app data.');
    ctx.reply('Error: Unable to process game data. Please try again.');
    return;
  }

  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const parsedData = JSON.parse(webAppData.data.json());
    const userRef = doc(db, 'users', telegramUser.id.toString());
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.error('Error: User not found in database.');
      ctx.reply('Error: User not found. Please start the game again.');
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
    ctx.answerCbQuery('An error occurred while processing game data. Please try again. Error details: ' + (error instanceof Error ? error.message : String(error)));
  }
});

export default bot;

