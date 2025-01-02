import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDVOXhGk_Zr1KyR2fTveWFu4D6LX_8hfRQ",
  authDomain: "baby-cheetah.firebaseapp.com",
  databaseURL: "https://baby-cheetah-default-rtdb.firebaseio.com",
  projectId: "baby-cheetah",
  storageBucket: "baby-cheetah.firebasestorage.app",
  messagingSenderId: "273145423682",
  appId: "1:273145423682:web:e32a4a92ae70f456164adb",
  measurementId: "G-WKV5C9006C"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

