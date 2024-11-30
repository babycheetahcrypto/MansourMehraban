'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const CryptoGame = dynamic(() => import('@/components/crypto-game'), {
  ssr: false,
});

export default function Page() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      webApp.ready();
      webApp.expand();

      const initializeUser = async () => {
        try {
          setIsLoading(true);
          const telegramUser = webApp.initDataUnsafe.user;
          if (!telegramUser) {
            setIsLoading(false);
            return;
          }

          // First register the user
          const registerResponse = await fetch('/api/auth/register', {
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
                level: 1,
                exp: 0,
              },
            }),
          });

          if (!registerResponse.ok) {
            throw new Error('Failed to register user');
          }

          // Then fetch user data using header
          const userDataResponse = await fetch('/api/user', {
            headers: {
              'x-telegram-id': telegramUser.id.toString(),
            },
          });

          if (!userDataResponse.ok) {
            throw new Error('Failed to fetch user data');
          }

          const userData = await userDataResponse.json();
          setUserData(userData);
        } catch (error) {
          console.error('Error initializing user:', error);
        } finally {
          setIsLoading(false);
        }
      };

      initializeUser();
    }
  }, []);

  return <CryptoGame userData={userData} />;
}
