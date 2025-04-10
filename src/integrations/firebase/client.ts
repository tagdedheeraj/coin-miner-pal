
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDin693hz8PWmfZvEx6huJE7Ct20yFLYkE",
  authDomain: "infinum-8f7b2.firebaseapp.com",
  projectId: "infinum-8f7b2",
  storageBucket: "infinum-8f7b2.appspot.com",
  messagingSenderId: "826806760124",
  appId: "1:826806760124:web:6c1bf95b150b96f92c96b9",
  measurementId: "G-MER6MD0LGX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
let analytics;

// Only initialize analytics in browser environment
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, analytics };
