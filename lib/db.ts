import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, increment, DocumentReference } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { User } from '../types/user';
import { GameData } from '../types/game-data';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function getUser(userId: string): Promise<User | null> {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (userDoc.exists()) {
    return userDoc.data() as User;
  }
  
  return null;
}

export async function updateUser(userId: string, data: Partial<User>): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, data);
}

export async function incrementUserCoins(userId: string, amount: number): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    coins: increment(amount)
  });
}

export async function getGameData(userId: string): Promise<GameData | null> {
  const gameDataRef = doc(db, 'gameData', userId);
  const gameDataDoc = await getDoc(gameDataRef);
  
  if (gameDataDoc.exists()) {
    return gameDataDoc.data() as GameData;
  }
  
  return null;
}

export async function createGameData(userId: string, initialData: GameData): Promise<void> {
  const gameDataRef = doc(db, 'gameData', userId);
  await setDoc(gameDataRef, initialData);
}

export async function updateGameData(userId: string, data: Partial<GameData>): Promise<void> {
  const gameDataRef = doc(db, 'gameData', userId);
  await updateDoc(gameDataRef, data);
}

export async function incrementGameDataField(userId: string, field: keyof GameData, amount: number): Promise<void> {
  const gameDataRef = doc(db, 'gameData', userId);
  await updateDoc(gameDataRef, {
    [field]: increment(amount)
  });
}

export { increment };
export default db;

