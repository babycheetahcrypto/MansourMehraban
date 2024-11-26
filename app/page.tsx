'use client';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { prisma } from '@/lib/prisma'; // Adjust the import based on your project structure

// Dynamically import the CryptoGame component
const CryptoGame = dynamic(() => import('@/components/crypto-game'), {
  ssr: false,
});

export default function Page() {
  useEffect(() => {
    // Ensure Telegram WebApp is initialized
    if (window.Telegram && window.Telegram.WebApp) {
      const webApp = window.Telegram.WebApp;
      webApp.ready();
      webApp.expand();

      // Define the fetchUser  function
      const fetchUser = async (): Promise<void> => {
        try {
          const telegramUser = webApp.initDataUnsafe.user;

          if (telegramUser) {
            const response = await fetch('/api/auth/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                user: {
                  id: telegramUser.id,
                  username: telegramUser.username,
                  first_name: telegramUser.first_name,
                  last_name: telegramUser.last_name,
                },
                initData: webApp.initData,
              }),
            });

            if (!response.ok) {
              console.error('Failed to fetch user data:', await response.json());
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };

      fetchUser(); // Call the function
    }
  }, []);

  return <CryptoGame />;
}
