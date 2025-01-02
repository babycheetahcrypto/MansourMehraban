import { Telegraf, Context } from 'telegraf';
import { getUser, updateUser, createGameData } from './lib/db';
import { User } from './types/user';
import { GameData } from './types/game-data';

if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN is not set in the environment variables');
  process.exit(1);
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.command('start', async (ctx: Context) => {
  const telegramUser = ctx.from;
  if (!telegramUser) {
    console.error('Unable to get user information');
    await ctx.reply('Error: Unable to get user information.');
    return;
  }

  console.log('Start command received from user:', telegramUser.id);

  const welcomeMessage = `
Welcome *${telegramUser.first_name}*! 🐾🎉

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
      console.log('Creating new user:', telegramUser.id);
      const newUser: User = {
        id: telegramUser.id.toString(),
        telegramId: telegramUser.id.toString(),
        username: telegramUser.username || `user${telegramUser.id}`,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        coins: 0,
        level: 1,
        exp: 0,
        profilePhoto: '',
        clickPower: 1,
        energy: 2000,
        multiplier: 1,
        profitPerHour: 0,
        boosterCredits: 1,
        unlockedLevels: [1],
        pphAccumulated: 0,
        selectedCoinImage: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Broke%20Cheetah-FBrjrv6G0CRgHFPjLh3I4l3RGMONVS.png',
        friendsCoins: {},
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
      await updateUser(newUser.id, newUser);
      user = newUser;

      console.log('Creating initial game data for user:', telegramUser.id);
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
    }

    const gameUrl = `${process.env.NEXT_PUBLIC_WEBAPP_URL}?startapp=${telegramUser.id}`;
    console.log('Game URL:', gameUrl);

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
    console.log('Welcome message sent successfully');
  } catch (error) {
    console.error('Error in /start command:', error);
    await ctx.reply('An error occurred while setting up your game. Please try again later.');
  }
});

export default bot;

