import { doc, getDoc, setDoc, updateDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { User } from '@/types/user';
import { GameData } from '@/types/game-data';

export async function getUser(userId: string): Promise<User | null> {
  try {
    console.log('Fetching user data for userId:', userId);
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      console.log('User data retrieved successfully for userId:', userId);
      return userSnap.data() as User;
    } else {
      console.log('User not found for userId:', userId);
      return null;
    }
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export async function updateUser(userId: string, userData: Partial<User>): Promise<void> {
  try {
    console.log('Updating user data for userId:', userId);
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, userData);
    console.log('User data updated successfully for userId:', userId);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function createUser(userData: User): Promise<void> {
  try {
    console.log('Creating new user with userId:', userData.id);
    const userRef = doc(db, 'users', userData.id);
    await setDoc(userRef, userData);
    console.log('User created successfully for userId:', userData.id);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function getGameData(userId: string): Promise<GameData | null> {
  try {
    console.log('Fetching game data for userId:', userId);
    const gameDataRef = doc(db, 'gameData', userId);
    const gameDataSnap = await getDoc(gameDataRef);

    if (gameDataSnap.exists()) {
      console.log('Game data retrieved successfully for userId:', userId);
      return gameDataSnap.data() as GameData;
    } else {
      console.log('Game data not found for userId:', userId);
      return null;
    }
  } catch (error) {
    console.error('Error getting game data:', error);
    return null;
  }
}

export async function updateGameData(userId: string, gameData: Partial<GameData>): Promise<void> {
  try {
    console.log('Updating game data for userId:', userId);
    const gameDataRef = doc(db, 'gameData', userId);
    await updateDoc(gameDataRef, gameData);
    console.log('Game data updated successfully for userId:', userId);
  } catch (error) {
    console.error('Error updating game data:', error);
    throw error;
  }
}

export async function createGameData(userId: string, gameData: GameData): Promise<void> {
  try {
    console.log('Creating game data for userId:', userId);
    const gameDataRef = doc(db, 'gameData', userId);
    await setDoc(gameDataRef, gameData);
    console.log('Game data created successfully for userId:', userId);
  } catch (error) {
    console.error('Error creating game data:', error);
    throw error;
  }
}

export async function getLeaderboard(): Promise<User[]> {
  try {
    console.log('Fetching leaderboard data');
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('coins', 'desc'), limit(100));
    const querySnapshot = await getDocs(q);
    const leaderboard = querySnapshot.docs.map(doc => doc.data() as User);
    console.log('Leaderboard data fetched successfully');
    return leaderboard;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

export { db };