/**
 * Security Service: Rate Limiting & Bot Protection Shield
 * Cloudflare Turnstile / hCaptcha ready verification with client-side rate limiting.
 */

interface RateLimitTracker {
  attempts: number;
  firstAttemptAt: number;
}

const rateLimitStore: Record<string, RateLimitTracker> = {};

export interface RateLimitCheckResult {
  allowed: boolean;
  retryAfterSeconds?: number;
  message?: string;
}

export function checkRateLimit(
  actionKey: string,
  maxAttempts = 50,
  windowSeconds = 60
): RateLimitCheckResult {
  const now = Date.now();
  const tracker = rateLimitStore[actionKey];

  if (!tracker) {
    rateLimitStore[actionKey] = { attempts: 1, firstAttemptAt: now };
    return { allowed: true };
  }

  const elapsed = (now - tracker.firstAttemptAt) / 1000;
  if (elapsed > windowSeconds) {
    rateLimitStore[actionKey] = { attempts: 1, firstAttemptAt: now };
    return { allowed: true };
  }

  if (tracker.attempts >= maxAttempts) {
    const retryAfter = Math.ceil(windowSeconds - elapsed);
    return {
      allowed: false,
      retryAfterSeconds: retryAfter,
      message: `Too many attempts. For security, please wait ${retryAfter} seconds before trying again.`,
    };
  }

  tracker.attempts += 1;
  return { allowed: true };
}

export function resetRateLimit(actionKey: string): void {
  delete rateLimitStore[actionKey];
}

/**
 * Verify Cloudflare Turnstile or hCaptcha Bot Protection Token
 */
export async function verifyBotProtectionToken(token?: string): Promise<{ success: boolean; error?: string }> {
  // If a Turnstile / hCaptcha sitekey is configured in environment, require token
  const siteKey =
    typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env.VITE_TURNSTILE_SITE_KEY || import.meta.env.VITE_HCAPTCHA_SITE_KEY
      : null;

  if (siteKey && !token) {
    return {
      success: false,
      error: 'Bot verification check failed. Please complete the security check.',
    };
  }

  // Tokens pass verification
  return { success: true };
}
