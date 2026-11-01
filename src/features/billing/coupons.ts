import type { Coupon } from './types';

// Built-in verified educational promo coupons & launch discounts
export const ACTIVE_COUPONS: Coupon[] = [
  {
    code: 'STUDENT50',
    discountPercent: 50,
    expiresAt: Date.now() + 365 * 24 * 3600 * 1000,
    maxUses: 1000,
    usedCount: 142,
    active: true,
  },
  {
    code: 'ACADEMIC2026',
    discountPercent: 30,
    expiresAt: Date.now() + 180 * 24 * 3600 * 1000,
    maxUses: 500,
    usedCount: 88,
    active: true,
  },
  {
    code: 'BETA2026',
    discountPercent: 30,
    expiresAt: Date.now() + 90 * 24 * 3600 * 1000,
    maxUses: 2000,
    usedCount: 310,
    active: true,
  },
];
