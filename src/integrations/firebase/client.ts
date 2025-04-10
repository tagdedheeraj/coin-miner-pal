
// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyA1Q6lvX02J3pMzg62Ix5RJu3U7X-PSlC8",
  authDomain: "infi-7d716.firebaseapp.com",
  projectId: "infi-7d716",
  storageBucket: "infi-7d716.firebasestorage.app",
  messagingSenderId: "605711229652",
  appId: "1:605711229652:web:abb944063a26ff0b449141",
  measurementId: "G-ERRBMJCFM6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

// Create Google provider instance
export const googleProvider = new GoogleAuthProvider();

// Add login hint to always show account chooser
googleProvider.setCustomParameters({
  prompt: 'select_account',
  // Use 'postmessage' auth flow which can be more reliable in certain environments
  login_hint: 'user@example.com'
});

// In development environment, you might want to try emulators
// if (process.env.NODE_ENV === 'development') {
//   connectAuthEmulator(auth, 'http://localhost:9099');
// }

export { app, auth, db, storage, analytics };
