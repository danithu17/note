import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const env = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : {};

const firebaseConfig = {
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'chat-3af33',
  appId: env.VITE_FIREBASE_APP_ID || '1:542945871024:web:894c2e23d4492a2c082775',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'chat-3af33.firebasestorage.app',
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyBE-3MdwFrylHsX1gSc4q1MZnlvdbISBQo',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'chat-3af33.firebaseapp.com',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '542945871024',
  measurementId: 'G-11GTGYHK7F',
};

export function getFirebaseApp(): FirebaseApp {
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth {
  const app = getFirebaseApp();
  return getAuth(app);
}
