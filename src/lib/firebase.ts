
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzWBvbNyMV_svCBZ07EEsRLKH9qauNsYY",
  authDomain: "miner-d7c25.firebaseapp.com",
  projectId: "miner-d7c25",
  storageBucket: "miner-d7c25.firebasestorage.app", 
  messagingSenderId: "1081800364902",
  appId: "1:1081800364902:web:615da61fd33e73e6436ea7",
  measurementId: "G-YF5FKYM9Z6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
