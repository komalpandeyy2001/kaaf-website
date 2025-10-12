import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyCpKLbmDSxT69wqZyKczDjE7OM24O7erR4",
  authDomain: "bee-tennis-4626f.firebaseapp.com",
  projectId: "bee-tennis-4626f",
  storageBucket: "bee-tennis-4626f.firebasestorage.app",
  messagingSenderId: "932326165317",
  appId: "1:932326165317:web:0ecad7dcea3753bc394c2c",
  measurementId: "G-WC5FKHWFHL"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app);
export const db = getFirestore(app, "beetennisdb");
export const auth = getAuth(app);
export const functions = getFunctions(app, "us-central1");