import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const env = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : {};

const firebaseConfig = {
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'fir-1-3feab',
  appId: env.VITE_FIREBASE_APP_ID || '1:568859248241:web:84358fa3e8326503577dd0',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'fir-1-3feab.firebasestorage.app',
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyDbmlPB7UiwiW3gIVJ_pfuLvAVtzhi0lZE',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'fir-1-3feab.firebaseapp.com',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '568859248241',
  measurementId: 'G-7RKW7NGLYG',
};

export function getFirebaseApp(): FirebaseApp {
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth {
  const app = getFirebaseApp();
  return getAuth(app);
}
