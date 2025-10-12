import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyAKt2C42bijNPPShb96I3jH-h9Fcywoegg",
  authDomain: "kaaf-web.firebaseapp.com",
  projectId: "kaaf-web",
  storageBucket: "kaaf-web.firebasestorage.app",
  messagingSenderId: "67156408999",
  appId: "1:67156408999:web:6cd99e6be8c19496ae3982",
  measurementId: "G-6ZSX04REBS"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app);
export const db = getFirestore(app, "beetennisdb");
export const auth = getAuth(app);
export const functions = getFunctions(app, "us-central1");