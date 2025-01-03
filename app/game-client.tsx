'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { User } from '@/types/user';
import { GameData } from '@/types/game-data';

const CryptoGame = dynamic(() => import('@/components/crypto-game'), {
  ssr: false,
}) as React.ComponentType<{
  userData: User | null;
  gameData: GameData | null;
  onCoinsUpdate: (amount: number) => Promise<void>;
  saveUserData: (userData: Partial<User>) => Promise<void>;
  saveGameData: (gameData: Partial<GameData>) => Promise<void>;
}>;

export default function GameClient() {
  const [userData, setUserData] = useState<User | null>(null);
  const [gameData, setGameData] = useState<GameData | null>(null);

  const fetchUserData = useCallback(async (telegramId: string) => {
    try {
      const response = await fetch(`/api/user?telegramId=${telegramId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      setUserData(data.user);
      setGameData(data.gameData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
      const webApp = window.Telegram.WebApp;
      webApp.ready();
      webApp.expand();

      const telegramUser = webApp.initDataUnsafe.user;
      console.log('Telegram user data:', telegramUser);

      if (telegramUser) {
        fetchUserData(telegramUser.id.toString()).catch(error => {
          console.error('Failed to load game data:', error);
          if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.showAlert('Failed to load game data. Please try again.');
          }
        });
      } else {
        console.error('No Telegram user data available');
        if (window.Telegram && window.Telegram.WebApp) {
          window.Telegram.WebApp.showAlert('Failed to load user data. Please try again.');
        }
      }
    } else {
      console.error('Telegram WebApp not available');
    }
  }, [fetchUserData]);

  const saveUserData = useCallback(
    async (updatedUserData: Partial<User>) => {
      if (!userData) return;
      try {
        const response = await fetch('/api/user', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            telegramId: userData.telegramId,
            userData: updatedUserData,
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to save user data');
        }
        setUserData((prev) => ({ ...prev!, ...updatedUserData }));
      } catch (error) {
        console.error('Error saving user data:', error);
      }
    },
    [userData]
  );

  const saveGameData = useCallback(
    async (updatedGameData: Partial<GameData>) => {
      if (!gameData) return;
      try {
        const response = await fetch('/api/user', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            telegramId: gameData.userId,
            gameData: updatedGameData,
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to save game data');
        }
        setGameData((prev) => ({ ...prev!, ...updatedGameData }));
      } catch (error) {
        console.error('Error saving game data:', error);
      }
    },
    [gameData]
  );

  const handleCoinsUpdate = useCallback(async (amount: number) => {
    if (!userData) return;
    const updatedCoins = userData.coins + amount;
    await saveUserData({ coins: updatedCoins });
  }, [userData, saveUserData]);

  return (
    <CryptoGame 
      userData={userData}
      gameData={gameData}
      onCoinsUpdate={handleCoinsUpdate}
      saveUserData={saveUserData}
      saveGameData={saveGameData}
    />
  );
}

