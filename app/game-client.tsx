'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { User } from '@/types/user';
import { GameData } from '@/types/game-data';
import { getUser, updateUser, createUser, getGameData, updateGameData, createGameData } from '@/lib/db';

const CryptoGame = dynamic(() => import('@/components/crypto-game'), {
  ssr: false,
}) as React.ComponentType<{
  userData: User | null;
  onCoinsUpdate: (amount: number) => Promise<void>;
  saveUserData: (userData: Partial<User>) => Promise<void>;
}>;

export default function GameClient() {
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
        const webApp = window.Telegram.WebApp;
        webApp.ready();
        webApp.expand();

        const telegramUser = webApp.initDataUnsafe.user;
        console.log('Telegram user data:', telegramUser);

        if (telegramUser) {
          let user = await getUser(telegramUser.id.toString());
          
          if (user) {
            console.log('Fetched user data:', user);
            setUserData(user);

            // Fetch game data
            const gameData = await getGameData(user.id);
            if (gameData) {
              // Update user data with game data
              setUserData(prevUser => {
                if (!prevUser) return null;
                return {
                  ...prevUser,
                  ...gameData,
                  lastBoosterReset: gameData.lastBoosterReset,
                  multiplierEndTime: gameData.multiplierEndTime,
                  boosterCooldown: gameData.boosterCooldown,
                  dailyReward: {
                    ...gameData.dailyReward,
                    lastClaimed: gameData.dailyReward.lastClaimed,
                  },
                };
              });
            } else {
              // Create game data if it doesn't exist
              const newGameData: GameData = {
                userId: user.id,
                level: user.level,
                exp: user.exp,
                clickPower: user.clickPower,
                energy: user.energy,
                multiplier: user.multiplier,
                profitPerHour: user.profitPerHour,
                boosterCredits: user.boosterCredits,
                unlockedLevels: user.unlockedLevels,
                pphAccumulated: user.pphAccumulated,
                selectedCoinImage: user.selectedCoinImage,
                shopItems: user.shopItems,
                premiumShopItems: user.premiumShopItems,
                tasks: user.tasks,
                dailyReward: user.dailyReward,
                multiplierEndTime: user.multiplierEndTime,
                boosterCooldown: user.boosterCooldown,
                lastBoosterReset: user.lastBoosterReset,
              };
              await createGameData(user.id, newGameData);
            }
          } else {
            // User not found, create a new user
            const newUser: User = {
              id: telegramUser.id.toString(),
              telegramId: telegramUser.id.toString(),
              username: telegramUser.username || `user${telegramUser.id}`,
              firstName: telegramUser.first_name,
              lastName: telegramUser.last_name,
              coins: 0,
              level: 1,
              exp: 0,
              profilePhoto: telegramUser.photo_url || '',
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

            await createUser(newUser);
            const newGameData: GameData = {
              userId: newUser.id,
              level: newUser.level,
              exp: newUser.exp,
              clickPower: newUser.clickPower,
              energy: newUser.energy,
              multiplier: newUser.multiplier,
              profitPerHour: newUser.profitPerHour,
              boosterCredits: newUser.boosterCredits,
              unlockedLevels: newUser.unlockedLevels,
              pphAccumulated: newUser.pphAccumulated,
              selectedCoinImage: newUser.selectedCoinImage,
              shopItems: newUser.shopItems,
              premiumShopItems: newUser.premiumShopItems,
              tasks: newUser.tasks,
              dailyReward: newUser.dailyReward,
              multiplierEndTime: newUser.multiplierEndTime,
              boosterCooldown: newUser.boosterCooldown,
              lastBoosterReset: newUser.lastBoosterReset,
            };
            await createGameData(newUser.id, newGameData);

            console.log('Created new user:', newUser);
            setUserData(newUser);
          }
        } else {
          setError('No Telegram user data available');
        }
      } else {
        setError('Telegram WebApp not available');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load game data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const saveUserData = useCallback(
    async (updatedUserData: Partial<User>) => {
      if (!userData) return;
      try {
        await updateUser(userData.id, updatedUserData);
        const gameDataUpdate: Partial<GameData> = {
          ...updatedUserData,
          userId: userData.id,
        };
        await updateGameData(userData.id, gameDataUpdate);
        setUserData((prevUserData) => ({
          ...prevUserData!,
          ...updatedUserData,
        }));
        console.log('User and game data saved successfully:', updatedUserData);
      } catch (error) {
        console.error('Error saving user and game data:', error);
        setError('Failed to save game data. Please try again.');
      }
    },
    [userData]
  );

  const handleCoinsUpdate = async (amount: number) => {
    if (!userData) return;
    const updatedCoins = userData.coins + amount;
    await saveUserData({ coins: updatedCoins });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <CryptoGame userData={userData} onCoinsUpdate={handleCoinsUpdate} saveUserData={saveUserData} />
  );
}

