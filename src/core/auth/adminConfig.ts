/**
 * Centralized Sovereign Admin & God Mode Configuration
 * Keeps admin credentials strictly protected and anonymous from other users.
 */
export const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'nimjayad@gmail.com').toLowerCase().trim();

export function isSystemAdmin(email?: string | null): boolean {
  if (!email) return false;
  return email.toLowerCase().trim() === ADMIN_EMAIL;
}
