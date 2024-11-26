'use client';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';

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
          // Retrieve the user data from Telegram WebApp
          const telegramUser = webApp.initDataUnsafe.user;

          if (telegramUser) {
            // Send user data to the API for registration
            const response = await fetch('/api/auth/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                user: {
                  telegramId: telegramUser.id,
                  username: telegramUser.username,
                  firstName: telegramUser.first_name,
                  lastName: telegramUser.last_name,
                },
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
