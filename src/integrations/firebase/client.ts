
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

console.log('Initializing Firebase...');

const firebaseConfig = {
  apiKey: "AIzaSyDin693hz8PWmfZvEx6huJE7Ct20yFLYkE",
  authDomain: "infinum-8f7b2.firebaseapp.com",
  projectId: "infinum-8f7b2",
  storageBucket: "infinum-8f7b2.appspot.com",
  messagingSenderId: "826806760124",
  appId: "1:826806760124:web:6c1bf95b150b96f92c96b9",
  measurementId: "G-MER6MD0LGX"
};

// Define app and auth as variables that will be populated in try-catch
let app;
let auth;

try {
  // Initialize Firebase
  console.log('Attempting to initialize Firebase...');
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization failed:', error);
  // Create fallback exports to prevent import errors
  app = null;
  auth = null;
}

// Export the variables that were set in the try-catch
export { app, auth };
