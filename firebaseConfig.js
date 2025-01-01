import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDVOXhGk_Zr1KyR2fTveWFu4D6LX_8hfRQ",
    authDomain: "baby-cheetah.firebaseapp.com",
    projectId: "baby-cheetah",
    storageBucket: "baby-cheetah.firebasestorage.app",
    messagingSenderId: "273145423682",
    appId: "1:273145423682:web:e32a4a92ae70f456164adb",
    measurementId: "G-WKV5C9006C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };