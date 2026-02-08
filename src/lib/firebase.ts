import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAchNFyDPi3NfB8Z5jKkx0Fe7hpFeNW9TE",
  authDomain: "greenmedical-1f360.firebaseapp.com",
  projectId: "greenmedical-1f360",
  storageBucket: "greenmedical-1f360.firebasestorage.app",
  messagingSenderId: "64588628878",
  appId: "1:64588628878:web:7a0e0648073c891f5c1adf",
  measurementId: "G-Z9GWQMHW26",
} as const;

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
