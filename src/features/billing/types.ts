export type PlanId = 'free' | 'pro_student' | 'pro' | 'team' | 'pro_monthly' | 'pro_yearly';

export type FeatureKey =
  | 'notes_count'
  | 'notebooks_count'
  | 'storage_mb'
  | 'cloud_sync'
  | 'devices'
  | 'canvas_basic_tools'
  | 'canvas_advanced'
  | 'pdf_import_annotate'
  | 'audio_record_minutes_per_note'
  | 'audio_synced_notes'
  | 'ocr_handwriting_search'
  | 'ai_assistant_messages_per_month'
  | 'ai_flashcards_quiz'
  | 'version_history_days'
  | 'export_formats'
  | 'share_links'
  | 'collaboration'
  | 'priority_support'
  | 'themes_accents'
  // Legacy aliases
  | 'unlimited_notes'
  | 'pdf_annotate'
  | 'audio_sync'
  | 'ai_assistant'
  | 'ocr_search'
  | 'max_storage_mb'
  | 'max_audio_minutes'
  | 'export_pdf'
  | 'team_collaboration';

export interface Plan {
  id: PlanId;
  name: string;
  monthlyUsd: number;
  yearlyUsd: number;
  monthlyLkr: number;
  yearlyLkr: number;
  description: string;
  badge?: string;
  isPopular?: boolean;
  requiresStudentVerification?: boolean;
  // Legacy single price helpers
  priceUsd?: number;
  priceLkr?: number;
  billingInterval?: 'free' | 'month' | 'year';
}

export interface PlanFeatureLimit {
  featureKey: FeatureKey;
  enabled: boolean;
  limit: number | null; // null = unlimited, number = ceiling
  customNote?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: PlanId;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  provider: 'stripe' | 'payhere' | 'play_store' | 'manual';
  billingCycle?: 'monthly' | 'annual';
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

export interface StudentVerification {
  userId: string;
  email: string;
  institution?: string;
  status: 'unverified' | 'pending' | 'verified' | 'rejected';
  submittedAt?: number;
  verifiedAt?: number;
  documentName?: string;
  documentDataUrl?: string;
  rejectionReason?: string;
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

export type PricingVariant = 'variant_a' | 'variant_b';

export interface TransactionRecord {
  id: string;
  orderId: string;
  userId: string;
  userEmail: string;
  planId: PlanId;
  provider: 'stripe' | 'payhere' | 'play_store' | 'manual';
  billingCycle: 'monthly' | 'annual';
  amount: number;
  currency: 'USD' | 'LKR';
  status: 'verified' | 'refunded' | 'pending';
  timestamp: number;
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
    | 'update_limit'
    | 'update_pricing'
    | 'verify_student'
    | 'reject_student'
    | 'toggle_ab_test'
    | 'automated_payment';
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
  // Automated Payment Engine Telemetry
  totalAutomatedTransactions?: number;
  totalRevenueUsd?: number;
  totalRevenueLkr?: number;
  stripeVolumeUsd?: number;
  payhereVolumeLkr?: number;
  stripeTxCount?: number;
  payhereTxCount?: number;
  recentTransactions?: TransactionRecord[];
}
