import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { User } from '@/types/user';
import { GameData } from '@/types/game-data';

export async function getUser(userId: string): Promise<User | null> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as User;
  } else {
    return null;
  }
}

export async function updateUser(userId: string, userData: Partial<User>): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, userData);
}

export async function createGameData(userId: string, gameData: GameData): Promise<void> {
  const gameDataRef = doc(db, 'gameData', userId);
  await setDoc(gameDataRef, gameData);
}

export async function getGameData(userId: string): Promise<GameData | null> {
  const gameDataRef = doc(db, 'gameData', userId);
  const gameDataSnap = await getDoc(gameDataRef);

  if (gameDataSnap.exists()) {
    return gameDataSnap.data() as GameData;
  } else {
    return null;
  }
}

export async function updateGameData(userId: string, gameData: Partial<GameData>): Promise<void> {
  const gameDataRef = doc(db, 'gameData', userId);
  await updateDoc(gameDataRef, gameData);
}

// Export the db instance
export { db };

