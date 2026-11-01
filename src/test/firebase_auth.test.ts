import { describe, it, expect } from 'vitest';
import { getFirebaseAuth } from '../core/firebase/client';
import { firebaseSignUpWithEmail } from '../core/firebase/authService';

describe('Firebase Cloud Authentication', () => {
  it('initializes Firebase Auth instance', () => {
    const auth = getFirebaseAuth();
    expect(auth).toBeDefined();
    expect(auth.app.name).toBe('[DEFAULT]');
  });

  it('attempts Firebase cloud signup/signin', async () => {
    const res = await firebaseSignUpWithEmail('test.scribblenote@gmail.com', 'SecurePassword123!', 'Scribble User');
    console.log('Firebase signup response:', res);
    expect(res).toHaveProperty('success');
  });
});
