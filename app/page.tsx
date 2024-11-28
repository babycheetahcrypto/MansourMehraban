'use client';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const CryptoGame = dynamic(() => import('@/components/crypto-game'), {
  ssr: false,
});

export default function Page() {
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      webApp.ready();
      webApp.expand();

      const initializeUser = async () => {
        try {
          const telegramUser = webApp.initDataUnsafe.user;
          if (!telegramUser) return;

          // First register the user
          await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user: {
                telegramId: telegramUser.id,
                username: telegramUser.username || `user${telegramUser.id}`,
                firstName: telegramUser.first_name,
                lastName: telegramUser.last_name,
                coins: 0,
                profitperhour: 0,
                profitperday: 0,
                profitperweek: 0,
                profitpermonth: 0,
                profitperyear: 0,
                totalprofit: 0,
                lastClaim: new Date().toISOString(),
                shopitems: [],
                premiumShopItems: [],
                tasks: [],
                dailyReward: 0,
                unlockedLevels: [],
                clickPower: 0,
                friendsCoins: 0,
                friends: [],
                level: 1,
                tasksCompleted: 0,
                lastTaskCompleted: new Date().toISOString(),
                energy: 1000,
                pphAccumulated: 0,
                multiplier: 1,
                multiplierEndTime: new Date().toISOString(),
                boosterCooldown: 0,
                selectedCoinImage: '',
                settings: {
                  sound: true,
                  music: true,
                  vibration: true,
                },
              },
            }),
          });

          // Then fetch user data using header
          await fetch('/api/user', {
            headers: {
              'x-telegram-id': telegramUser.id.toString(),
            },
          });
        } catch (error) {
          console.error('Error initializing user:', error);
        }
      };

      initializeUser();
    }
  }, []);

  return <CryptoGame />;
}
