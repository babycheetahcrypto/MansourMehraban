'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { User } from '@/types/user';
import { GameData } from '@/types/game-data';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { getUser, createUser, getGameData, createGameData, updateUser, updateGameData } from '@/lib/db';

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

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      let user = await getUser(userId);
      let game = await getGameData(userId);

      if (!user) {
        console.log('Creating new user:', userId);
        const newUser: User = {
          id: userId,
          telegramId: userId,
          username: `user${userId}`,
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
        await createUser(newUser);
        user = newUser;
      }

      if (!game) {
        console.log('Creating initial game data for user:', userId);
        const initialGameData: GameData = {
          userId: userId,
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
        await createGameData(userId, initialGameData);
        game = initialGameData;
      }

      setUserData(user);
      setGameData(game);

      // Set up real-time listeners
      const userDocRef = doc(db, 'users', userId);
      const gameDataRef = doc(db, 'gameData', userId);

      onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          setUserData(doc.data() as User);
        }
      });

      onSnapshot(gameDataRef, (doc) => {
        if (doc.exists()) {
          setGameData(doc.data() as GameData);
        }
      });

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
        await updateUser(userData.id, updatedUserData);
        console.log('User data saved successfully:', updatedUserData);
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
        await updateGameData(gameData.userId, updatedGameData);
        console.log('Game data saved successfully:', updatedGameData);
      } catch (error) {
        console.error('Error saving game data:', error);
      }
    },
    [gameData]
  );

  const handleCoinsUpdate = async (amount: number) => {
    if (!userData) return;
    const updatedCoins = userData.coins + amount;
    await saveUserData({ coins: updatedCoins });
  };

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

