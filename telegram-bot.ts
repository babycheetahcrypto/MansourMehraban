import { Telegraf, Context } from 'telegraf';
import { getUser, updateUser, createGameData, updateGameData, incrementGameDataField } from './lib/db';
import { User } from './types/user';
import { GameData } from './types/game-data';

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
    let user = await getUser(telegramUser.id.toString());

    if (!user) {
      const newUser: User = {
        id: telegramUser.id.toString(),
        telegramId: telegramUser.id.toString(),
        username: telegramUser.username || `user${telegramUser.id}`,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        coins: 0,
        profilePhoto: '',
        friendsCoins: {},
        level: 1,
        exp: 0,
        shopItems: [],
        premiumShopItems: [],
        clickPower: 1,
        energy: 2000,
        multiplier: 1,
        profitPerHour: 0,
        boosterCredits: 1,
        unlockedLevels: [1],
        pphAccumulated: 0,
        selectedCoinImage: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Broke%20Cheetah-FBrjrv6G0CRgHFPjLh3I4l3RGMONVS.png',
        tasks: [],
        dailyReward: {
          lastClaimed: null,
          streak: 0,
          day: 1,
          completed: false,
        },
        multiplierEndTime: null,
        boosterCooldown: null,
        lastBoosterReset: null,
      };
      await updateUser(newUser.id, newUser);
      user = newUser;

      const initialGameData: GameData = {
        userId: user.id,
        level: 1,
        exp: 0,
        clickPower: 1,
        energy: 2000,
        multiplier: 1,
        profitPerHour: 0,
        boosterCredits: 1,
        unlockedLevels: [1],
        pphAccumulated: 0,
        selectedCoinImage: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Broke%20Cheetah-FBrjrv6G0CRgHFPjLh3I4l3RGMONVS.png',
        shopItems: [],
        premiumShopItems: [],
        tasks: [],
        dailyReward: {
          lastClaimed: null,
          streak: 0,
          day: 1,
          completed: false,
        },
        multiplierEndTime: null,
        boosterCooldown: null,
        lastBoosterReset: null,
      };
      await createGameData(user.id, initialGameData);
    } else {
      // Update existing user's information
      await updateUser(user.id, {
        username: telegramUser.username || user.username,
        firstName: telegramUser.first_name || user.firstName,
        lastName: telegramUser.last_name || user.lastName,
      });
    }

    const gameUrl = `${process.env.NEXT_PUBLIC_WEBAPP_URL}?start=${telegramUser.id}`;

    // Send welcome message with photo and game start button
    await ctx.replyWithPhoto(
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Golden%20Cheetah.jpg-lskB9XxIu4pBhjth9Pm42BIeveRNPq.jpeg',
      },
      {
        caption: welcomeMessage,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Start Game 🚀', web_app: { url: gameUrl } }],
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
    const userId = telegramUser.id.toString();

    ctx.answerCbQuery('Game data updated successfully!');
  } catch (error) {
    console.error('Error processing web app data:', error);
    ctx.answerCbQuery('An error occurred while processing game data.');
  }
});

export default bot;

