'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const CryptoGame = dynamic(() => import('@/components/crypto-game'), {
  ssr: false,
});

export default function Page() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      webApp.ready();
      webApp.expand();

      const initializeUser = async () => {
        try {
          const telegramUser = webApp.initDataUnsafe.user;
          if (!telegramUser) return;

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
        }
      };

      initializeUser();
    }
  }, []);

  return <CryptoGame userData={userData} />;
}
