export type PlanId = 'free' | 'pro_monthly' | 'pro_yearly' | 'team';

export type FeatureKey =
  | 'unlimited_notes'
  | 'pdf_annotate'
  | 'audio_sync'
  | 'ai_assistant'
  | 'ocr_search'
  | 'cloud_sync'
  | 'max_storage_mb'
  | 'max_audio_minutes'
  | 'export_pdf'
  | 'team_collaboration';

export interface Plan {
  id: PlanId;
  name: string;
  priceUsd: number;
  priceLkr: number;
  billingInterval: 'month' | 'year' | 'free';
  description: string;
  isPopular?: boolean;
}

export interface PlanFeatureLimit {
  featureKey: FeatureKey;
  enabled: boolean;
  limit: number | null; // null = unlimited, number = ceiling
}

export interface Subscription {
  id: string;
  userId: string;
  planId: PlanId;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  provider: 'stripe' | 'payhere' | 'play_store' | 'manual';
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  couponApplied?: string;
  updatedAt: number;
}

export interface TrialInfo {
  userId: string;
  trialStart: number;
  trialEnd: number;
  isTrialActive: boolean;
  daysRemaining: number;
  remindersSent: ('day_7' | 'day_12' | 'last_day')[];
}

export interface Coupon {
  code: string;
  discountPercent: number;
  expiresAt: number | null;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
}

export interface UsageCounter {
  userId: string;
  featureKey: FeatureKey;
  currentUsage: number;
  periodStart: number;
}

export interface AdminAuditRecord {
  id: string;
  adminId: string;
  action:
    | 'extend_trial'
    | 'grant_plan'
    | 'revoke_plan'
    | 'suspend_user'
    | 'create_coupon'
    | 'toggle_feature'
    | 'update_limit';
  targetUserId?: string;
  details: string;
  timestamp: number;
}

export interface BusinessMetrics {
  totalUsers: number;
  activeTrials: number;
  paidSubscribers: number;
  mrrUsd: number;
  mrrLkr: number;
  churnRatePercent: number;
  conversionRatePercent: number;
  aiQueriesToday: number;
}
