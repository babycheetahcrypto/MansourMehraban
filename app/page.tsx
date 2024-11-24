'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the CryptoGame component to ensure client-side rendering
const CryptoGame = dynamic(() => import('@/components/crypto-game'), {
  ssr: false,
});

export default function Page() {
  const [isTelegramReady, setIsTelegramReady] = useState(false);

  useEffect(() => {
    // Ensure Telegram WebApp is initialized
    const initTelegramWebApp = () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;

        try {
          // Initialize WebApp
          webApp.ready();

          // Expand the WebApp to full screen
          webApp.expand();

          // Configure main button
          webApp.MainButton.setText('Play');
          webApp.MainButton.show();

          // Create a reference to the main button click handler
          const mainButtonHandler = () => {
            console.log('Main button clicked');
            // Add any specific action you want when main button is clicked
          };

          // Add event listener
          webApp.MainButton.onClick(mainButtonHandler);

          // Configure back button
          webApp.BackButton.show();

          // Create a reference to the back button click handler
          const backButtonHandler = () => {
            console.log('Back button clicked');
            webApp.close(); // Or implement custom back navigation
          };

          // Add event listener for back button
          webApp.BackButton.onClick(backButtonHandler);

          // Set theme parameters
          document.body.setAttribute('data-theme', webApp.colorScheme);

          // Verify user data
          const userData = webApp.initDataUnsafe.user;
          if (userData) {
            console.log('Telegram User:', userData);
          }

          setIsTelegramReady(true);

          // Return cleanup function
          return () => {
            // Note: Telegram WebApp doesn't provide a direct way to remove event listeners
            console.log('Cleaning up Telegram WebApp listeners');
          };
        } catch (error) {
          console.error('Telegram WebApp initialization error:', error);
        }
      } else {
        console.warn('Telegram WebApp is not available');
      }

      // Return empty cleanup if initialization fails
      return () => {};
    };

    // Run initialization
    const cleanup = initTelegramWebApp();

    // Fallback mechanism
    const checkInterval = setInterval(() => {
      if (!isTelegramReady) {
        initTelegramWebApp();
      } else {
        clearInterval(checkInterval);
      }
    }, 1000);

    // Cleanup
    return () => {
      clearInterval(checkInterval);
      cleanup(); // Call the cleanup function
    };
  }, []);

  // Render loading state if Telegram is not ready
  if (!isTelegramReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-white mb-4 mx-auto"></div>
          <p>Initializing Telegram WebApp...</p>
        </div>
      </div>
    );
  }

  // Render the game once Telegram is ready
  return <CryptoGame />;
}
