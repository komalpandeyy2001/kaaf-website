import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyDcGPv83qfhWq8mXEIWB6hF34XbYOsSrDw",
  authDomain: "kaaf-3f07d.firebaseapp.com",
  projectId: "kaaf-3f07d",
  storageBucket: "kaaf-3f07d.firebasestorage.app",
  messagingSenderId: "135289892449",
  appId: "1:135289892449:web:a7c5b7f18c2e3b6ff6c420",
  measurementId: "G-9Y6TMD1YCH"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app, "us-central1");