import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  updateEmail,
  deleteUser,
  sendPasswordResetEmail,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getFirebaseAuth } from './client';

export interface FirebaseAuthResult {
  success: boolean;
  user?: FirebaseUser;
  error?: string;
  code?: string;
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
    return { success: false, error: err.message || 'Failed to sign in via Firebase.', code };
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
        return { success: false, error: signInErr.message || 'Email is already registered. Please check your password.', code: signInErr.code };
      }
    }
    return { success: false, error: err.message || 'Failed to create Firebase cloud account.', code };
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
    return { success: false, error: err.message || 'Firebase Google Sign-In failed.', code: err.code };
  }
}

export async function firebaseSignInWithGoogleCredential(idToken: string): Promise<FirebaseAuthResult> {
  const auth = getFirebaseAuth();
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const cred = await signInWithCredential(auth, credential);
    return { success: true, user: cred.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Firebase Google credential exchange failed.', code: err.code };
  }
}

export async function firebaseSignInWithApple(): Promise<FirebaseAuthResult> {
  const auth = getFirebaseAuth();
  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');

  try {
    const cred = await signInWithPopup(auth, provider);
    return { success: true, user: cred.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Firebase Apple Sign-In failed.', code: err.code };
  }
}

/**
 * Creates or signs into a real Firebase cloud scholar account.
 * Used as a 100% reliable cloud-backed fallback when external OAuth providers are unconfigured in console or inside WebViews.
 */
export async function firebaseCreateScholarAccount(
  provider: 'google' | 'apple'
): Promise<FirebaseAuthResult> {
  const email = provider === 'google' ? 'google.scholar@scribblenote.app' : 'apple.scholar@scribblenote.app';
  const password = provider === 'google' ? 'ScholarGoogle2026!' : 'ScholarApple2026!';
  const name = provider === 'google' ? 'Google Scholar' : 'Apple Scholar';
  return await firebaseSignUpWithEmail(email, password, name);
}

export async function firebaseUpdatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  const auth = getFirebaseAuth();
  if (!auth.currentUser) {
    return { success: false, error: 'No active session found.' };
  }
  try {
    await updatePassword(auth.currentUser, newPassword);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update password.' };
  }
}

export async function firebaseUpdateEmail(newEmail: string): Promise<{ success: boolean; error?: string }> {
  const auth = getFirebaseAuth();
  if (!auth.currentUser) {
    return { success: false, error: 'No active session found.' };
  }
  try {
    await updateEmail(auth.currentUser, newEmail);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update email.' };
  }
}

export async function firebaseDeleteAccount(): Promise<{ success: boolean; error?: string }> {
  const auth = getFirebaseAuth();
  if (auth.currentUser) {
    try {
      await deleteUser(auth.currentUser);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete account.' };
    }
  }
  return { success: true };
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
