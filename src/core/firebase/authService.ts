import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getFirebaseAuth } from './client';

export interface FirebaseAuthResult {
  success: boolean;
  user?: FirebaseUser;
  error?: string;
}

export async function firebaseSignInWithEmail(email: string, password: string): Promise<FirebaseAuthResult> {
  const auth = getFirebaseAuth();
  const trimmed = email.toLowerCase().trim();

  try {
    const cred = await signInWithEmailAndPassword(auth, trimmed, password);
    return { success: true, user: cred.user };
  } catch (err: any) {
    const code = err.code || '';
    // Auto account creation: if account does not exist in Firebase, auto-create it!
    if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
      return await firebaseSignUpWithEmail(trimmed, password, trimmed.split('@')[0]);
    }
    return { success: false, error: err.message || 'Failed to sign in via Firebase.' };
  }
}

export async function firebaseSignUpWithEmail(
  email: string,
  password: string,
  name?: string
): Promise<FirebaseAuthResult> {
  const auth = getFirebaseAuth();
  const trimmed = email.toLowerCase().trim();

  try {
    const cred = await createUserWithEmailAndPassword(auth, trimmed, password);
    if (name && cred.user) {
      await updateProfile(cred.user, { displayName: name });
    }
    return { success: true, user: cred.user };
  } catch (err: any) {
    const code = err.code || '';
    // If user already exists in Firebase, auto sign-in!
    if (code === 'auth/email-already-in-use') {
      try {
        const cred = await signInWithEmailAndPassword(auth, trimmed, password);
        return { success: true, user: cred.user };
      } catch (signInErr: any) {
        return { success: false, error: signInErr.message || 'Email is already registered. Please check your password.' };
      }
    }
    return { success: false, error: err.message || 'Failed to create Firebase cloud account.' };
  }
}

export async function firebaseSignInWithGoogle(): Promise<FirebaseAuthResult> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    const cred = await signInWithPopup(auth, provider);
    return { success: true, user: cred.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Firebase Google Sign-In failed.' };
  }
}

export async function firebaseResetPassword(email: string): Promise<{ success: boolean; error?: string }> {
  const auth = getFirebaseAuth();
  try {
    await sendPasswordResetEmail(auth, email.trim());
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to send password reset email.' };
  }
}

export async function firebaseLogout(): Promise<void> {
  const auth = getFirebaseAuth();
  await firebaseSignOut(auth);
}

export function subscribeToFirebaseAuthState(callback: (user: FirebaseUser | null) => void): () => void {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, callback);
}
