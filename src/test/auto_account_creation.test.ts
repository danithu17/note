import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../core/auth/useAuthStore';

describe('Auto Account Creation & Email Rate Limit Immunity', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ user: null, error: null, isOnboarding: false });
  });

  it('automatically creates an account when signing in with a non-existent email', async () => {
    const res = await useAuthStore.getState().signInWithEmail('newstudent2026@gmail.com', 'SecurePass123!');
    expect(res.success).toBe(true);
    const currentUser = useAuthStore.getState().user;
    expect(currentUser).not.toBeNull();
    expect(currentUser?.email).toBe('newstudent2026@gmail.com');
    expect(currentUser?.plan).toBe('pro');
    expect(currentUser?.isGuest).toBe(false);
  }, 15000);

  it('does not block the user when email rate limit exceeded occurs during signup', async () => {
    const res = await useAuthStore.getState().signUpWithEmail('ratelimited_user@gmail.com', 'SecurePass123!', 'Alex Scholar');
    expect(res.success).toBe(true);
    const currentUser = useAuthStore.getState().user;
    expect(currentUser).not.toBeNull();
    expect(currentUser?.email).toBe('ratelimited_user@gmail.com');
    expect(currentUser?.plan).toBe('pro');
    expect(currentUser?.name).toBe('Alex Scholar');
  }, 15000);

  it('seamlessly logs in and auto-creates an account via Google sign in', async () => {
    const res = await useAuthStore.getState().signInWithGoogle();
    expect(res.success).toBe(true);
    const currentUser = useAuthStore.getState().user;
    expect(currentUser).not.toBeNull();
    expect(currentUser?.plan).toBe('pro');
    expect(currentUser?.isGuest).toBe(false);
  });

  it('seamlessly logs in and auto-creates an account via Apple sign in', async () => {
    const res = await useAuthStore.getState().signInWithApple();
    expect(res.success).toBe(true);
    const currentUser = useAuthStore.getState().user;
    expect(currentUser).not.toBeNull();
    expect(currentUser?.plan).toBe('pro');
    expect(currentUser?.isGuest).toBe(false);
  });
});
