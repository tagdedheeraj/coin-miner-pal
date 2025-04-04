
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkM-FK7dS6MxLNGHVIUsaJO_hX14lPeh4",
  authDomain: "infinium-acd0e.firebaseapp.com",
  projectId: "infinium-acd0e",
  storageBucket: "infinium-acd0e.firebasestorage.app",
  messagingSenderId: "539486419625",
  appId: "1:539486419625:web:14d765c89a93b15f1787b8",
  measurementId: "G-67XES8E2ML"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
