// lib/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBxuWp27L4iCRV2fxZXYLQDMs_KUXpF9ww",
  authDomain: "news-dashboard-2f117.firebaseapp.com",
  projectId: "news-dashboard-2f117",
  storageBucket: "news-dashboard-2f117.firebasestorage.app",
  messagingSenderId: "406967849638",
  appId: "1:406967849638:web:f4b3ba6fed86d5dca91a67",
  measurementId: "G-TYDZ8BQV1E"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ✅ re-export auth as default if you want
export { auth, provider, signInWithPopup, signOut };
