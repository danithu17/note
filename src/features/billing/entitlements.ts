import type {
  Plan,
  PlanId,
  FeatureKey,
  PlanFeatureLimit,
  Subscription,
  TrialInfo,
} from './types';

// ==============================================================================
// Plans Data (Admin-Editable, Regional LKR/USD, Stored as Data)
// ==============================================================================
export const DEFAULT_PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Starter Free',
    monthlyUsd: 0,
    yearlyUsd: 0,
    monthlyLkr: 0,
    yearlyLkr: 0,
    priceUsd: 0,
    priceLkr: 0,
    billingInterval: 'free',
    description: 'Essential offline lecture notes, handwriting, and local storage.',
  },
  pro_student: {
    id: 'pro_student',
    name: 'Pro Student',
    monthlyUsd: 2.99,
    yearlyUsd: 24.99,
    monthlyLkr: 590,
    yearlyLkr: 4990,
    priceUsd: 2.99,
    priceLkr: 590,
    billingInterval: 'month',
    description: 'Verified student discount (.edu / .ac.lk or campus ID card). Full Pro capabilities.',
    badge: 'Student Special',
    requiresStudentVerification: true,
  },
  pro: {
    id: 'pro',
    name: 'Pro Scholar',
    monthlyUsd: 4.99,
    yearlyUsd: 39.99,
    monthlyLkr: 990,
    yearlyLkr: 7990,
    priceUsd: 4.99,
    priceLkr: 990,
    billingInterval: 'month',
    description: 'Full lecture power for university students, educators, and engineers.',
    isPopular: true,
    badge: 'Most Popular',
  },
  // Legacy aliases mapped to Pro
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Pro Scholar (Monthly)',
    monthlyUsd: 4.99,
    yearlyUsd: 39.99,
    monthlyLkr: 990,
    yearlyLkr: 7990,
    priceUsd: 4.99,
    priceLkr: 990,
    billingInterval: 'month',
    description: 'Full lecture power with multi-device cloud sync and AI assistant.',
  },
  pro_yearly: {
    id: 'pro_yearly',
    name: 'Pro Scholar (Annual)',
    monthlyUsd: 4.99,
    yearlyUsd: 39.99,
    monthlyLkr: 990,
    yearlyLkr: 7990,
    priceUsd: 39.99,
    priceLkr: 7990,
    billingInterval: 'year',
    description: 'Save 33% per year with full multi-device cloud synchronization.',
    isPopular: true,
  },
  team: {
    id: 'team',
    name: 'Campus Lab',
    monthlyUsd: 3.99,
    yearlyUsd: 39.99,
    monthlyLkr: 790,
    yearlyLkr: 7990,
    priceUsd: 3.99,
    priceLkr: 790,
    billingInterval: 'month',
    badge: 'Campus & Research Labs',
    description: 'Collaborative academic workspaces, research pods, and departmental billing with per-person pricing.',
  },
};

// Aliases
export const PLANS = DEFAULT_PLANS;

// ==============================================================================
// Feature Matrix Data (Key = Feature Flag, Value = Limit Per Plan)
// ==============================================================================
export const DEFAULT_PLAN_ENTITLEMENTS: Record<PlanId, Record<FeatureKey, PlanFeatureLimit>> = {
  free: {
    notes_count: { featureKey: 'notes_count', enabled: true, limit: 30 },
    notebooks_count: { featureKey: 'notebooks_count', enabled: true, limit: 3 },
    storage_mb: { featureKey: 'storage_mb', enabled: true, limit: 100, customNote: 'Local only' },
    cloud_sync: { featureKey: 'cloud_sync', enabled: false, limit: null },
    devices: { featureKey: 'devices', enabled: true, limit: 1 },
    canvas_basic_tools: { featureKey: 'canvas_basic_tools', enabled: true, limit: null },
    canvas_advanced: { featureKey: 'canvas_advanced', enabled: false, limit: null },
    pdf_import_annotate: { featureKey: 'pdf_import_annotate', enabled: true, limit: 1 },
    audio_record_minutes_per_note: { featureKey: 'audio_record_minutes_per_note', enabled: true, limit: 10 },
    audio_synced_notes: { featureKey: 'audio_synced_notes', enabled: false, limit: null },
    ocr_handwriting_search: { featureKey: 'ocr_handwriting_search', enabled: false, limit: null },
    ai_assistant_messages_per_month: { featureKey: 'ai_assistant_messages_per_month', enabled: true, limit: 10 },
    ai_flashcards_quiz: { featureKey: 'ai_flashcards_quiz', enabled: true, limit: 3 },
    version_history_days: { featureKey: 'version_history_days', enabled: false, limit: 0 },
    export_formats: { featureKey: 'export_formats', enabled: true, limit: 2, customNote: 'PNG, MD' },
    share_links: { featureKey: 'share_links', enabled: false, limit: null },
    collaboration: { featureKey: 'collaboration', enabled: false, limit: null },
    priority_support: { featureKey: 'priority_support', enabled: false, limit: null },
    themes_accents: { featureKey: 'themes_accents', enabled: true, limit: 2 },
    // Legacy keys
    unlimited_notes: { featureKey: 'unlimited_notes', enabled: false, limit: 30 },
    pdf_annotate: { featureKey: 'pdf_annotate', enabled: false, limit: null },
    audio_sync: { featureKey: 'audio_sync', enabled: false, limit: null },
    ai_assistant: { featureKey: 'ai_assistant', enabled: true, limit: 10 },
    ocr_search: { featureKey: 'ocr_search', enabled: false, limit: null },
    max_storage_mb: { featureKey: 'max_storage_mb', enabled: true, limit: 100 },
    max_audio_minutes: { featureKey: 'max_audio_minutes', enabled: true, limit: 10 },
    export_pdf: { featureKey: 'export_pdf', enabled: false, limit: null },
    team_collaboration: { featureKey: 'team_collaboration', enabled: false, limit: null },
  },
  pro_student: {
    notes_count: { featureKey: 'notes_count', enabled: true, limit: null },
    notebooks_count: { featureKey: 'notebooks_count', enabled: true, limit: null },
    storage_mb: { featureKey: 'storage_mb', enabled: true, limit: 10240 },
    cloud_sync: { featureKey: 'cloud_sync', enabled: true, limit: null, customNote: 'All devices' },
    devices: { featureKey: 'devices', enabled: true, limit: null },
    canvas_basic_tools: { featureKey: 'canvas_basic_tools', enabled: true, limit: null },
    canvas_advanced: { featureKey: 'canvas_advanced', enabled: true, limit: null },
    pdf_import_annotate: { featureKey: 'pdf_import_annotate', enabled: true, limit: null },
    audio_record_minutes_per_note: { featureKey: 'audio_record_minutes_per_note', enabled: true, limit: null },
    audio_synced_notes: { featureKey: 'audio_synced_notes', enabled: true, limit: null },
    ocr_handwriting_search: { featureKey: 'ocr_handwriting_search', enabled: true, limit: null },
    ai_assistant_messages_per_month: { featureKey: 'ai_assistant_messages_per_month', enabled: true, limit: 300 },
    ai_flashcards_quiz: { featureKey: 'ai_flashcards_quiz', enabled: true, limit: null, customNote: 'Unlimited fair-use' },
    version_history_days: { featureKey: 'version_history_days', enabled: true, limit: 30 },
    export_formats: { featureKey: 'export_formats', enabled: true, limit: null, customNote: 'PNG, SVG, PDF, MD, JSON' },
    share_links: { featureKey: 'share_links', enabled: true, limit: null },
    collaboration: { featureKey: 'collaboration', enabled: false, limit: null },
    priority_support: { featureKey: 'priority_support', enabled: true, limit: null },
    themes_accents: { featureKey: 'themes_accents', enabled: true, limit: null },
    // Legacy keys
    unlimited_notes: { featureKey: 'unlimited_notes', enabled: true, limit: null },
    pdf_annotate: { featureKey: 'pdf_annotate', enabled: true, limit: null },
    audio_sync: { featureKey: 'audio_sync', enabled: true, limit: null },
    ai_assistant: { featureKey: 'ai_assistant', enabled: true, limit: 300 },
    ocr_search: { featureKey: 'ocr_search', enabled: true, limit: null },
    max_storage_mb: { featureKey: 'max_storage_mb', enabled: true, limit: 10240 },
    max_audio_minutes: { featureKey: 'max_audio_minutes', enabled: true, limit: null },
    export_pdf: { featureKey: 'export_pdf', enabled: true, limit: null },
    team_collaboration: { featureKey: 'team_collaboration', enabled: false, limit: null },
  },
  pro: {
    notes_count: { featureKey: 'notes_count', enabled: true, limit: null },
    notebooks_count: { featureKey: 'notebooks_count', enabled: true, limit: null },
    storage_mb: { featureKey: 'storage_mb', enabled: true, limit: 10240 },
    cloud_sync: { featureKey: 'cloud_sync', enabled: true, limit: null, customNote: 'All devices' },
    devices: { featureKey: 'devices', enabled: true, limit: null },
    canvas_basic_tools: { featureKey: 'canvas_basic_tools', enabled: true, limit: null },
    canvas_advanced: { featureKey: 'canvas_advanced', enabled: true, limit: null },
    pdf_import_annotate: { featureKey: 'pdf_import_annotate', enabled: true, limit: null },
    audio_record_minutes_per_note: { featureKey: 'audio_record_minutes_per_note', enabled: true, limit: null },
    audio_synced_notes: { featureKey: 'audio_synced_notes', enabled: true, limit: null },
    ocr_handwriting_search: { featureKey: 'ocr_handwriting_search', enabled: true, limit: null },
    ai_assistant_messages_per_month: { featureKey: 'ai_assistant_messages_per_month', enabled: true, limit: 500 },
    ai_flashcards_quiz: { featureKey: 'ai_flashcards_quiz', enabled: true, limit: null, customNote: 'Unlimited fair-use' },
    version_history_days: { featureKey: 'version_history_days', enabled: true, limit: 30 },
    export_formats: { featureKey: 'export_formats', enabled: true, limit: null, customNote: 'PNG, SVG, PDF, MD, JSON' },
    share_links: { featureKey: 'share_links', enabled: true, limit: null },
    collaboration: { featureKey: 'collaboration', enabled: false, limit: null },
    priority_support: { featureKey: 'priority_support', enabled: true, limit: null },
    themes_accents: { featureKey: 'themes_accents', enabled: true, limit: null },
    // Legacy keys
    unlimited_notes: { featureKey: 'unlimited_notes', enabled: true, limit: null },
    pdf_annotate: { featureKey: 'pdf_annotate', enabled: true, limit: null },
    audio_sync: { featureKey: 'audio_sync', enabled: true, limit: null },
    ai_assistant: { featureKey: 'ai_assistant', enabled: true, limit: 500 },
    ocr_search: { featureKey: 'ocr_search', enabled: true, limit: null },
    max_storage_mb: { featureKey: 'max_storage_mb', enabled: true, limit: 10240 },
    max_audio_minutes: { featureKey: 'max_audio_minutes', enabled: true, limit: null },
    export_pdf: { featureKey: 'export_pdf', enabled: true, limit: null },
    team_collaboration: { featureKey: 'team_collaboration', enabled: false, limit: null },
  },
  pro_monthly: {} as any, // Populated below
  pro_yearly: {} as any, // Populated below
  team: {
    notes_count: { featureKey: 'notes_count', enabled: true, limit: null },
    notebooks_count: { featureKey: 'notebooks_count', enabled: true, limit: null },
    storage_mb: { featureKey: 'storage_mb', enabled: true, limit: 102400 }, // 100 GB
    cloud_sync: { featureKey: 'cloud_sync', enabled: true, limit: null },
    devices: { featureKey: 'devices', enabled: true, limit: null },
    canvas_basic_tools: { featureKey: 'canvas_basic_tools', enabled: true, limit: null },
    canvas_advanced: { featureKey: 'canvas_advanced', enabled: true, limit: null },
    pdf_import_annotate: { featureKey: 'pdf_import_annotate', enabled: true, limit: null },
    audio_record_minutes_per_note: { featureKey: 'audio_record_minutes_per_note', enabled: true, limit: null },
    audio_synced_notes: { featureKey: 'audio_synced_notes', enabled: true, limit: null },
    ocr_handwriting_search: { featureKey: 'ocr_handwriting_search', enabled: true, limit: null },
    ai_assistant_messages_per_month: { featureKey: 'ai_assistant_messages_per_month', enabled: true, limit: 2000 },
    ai_flashcards_quiz: { featureKey: 'ai_flashcards_quiz', enabled: true, limit: null },
    version_history_days: { featureKey: 'version_history_days', enabled: true, limit: 90 },
    export_formats: { featureKey: 'export_formats', enabled: true, limit: null },
    share_links: { featureKey: 'share_links', enabled: true, limit: null },
    collaboration: { featureKey: 'collaboration', enabled: true, limit: null },
    priority_support: { featureKey: 'priority_support', enabled: true, limit: null },
    themes_accents: { featureKey: 'themes_accents', enabled: true, limit: null },
    // Legacy keys
    unlimited_notes: { featureKey: 'unlimited_notes', enabled: true, limit: null },
    pdf_annotate: { featureKey: 'pdf_annotate', enabled: true, limit: null },
    audio_sync: { featureKey: 'audio_sync', enabled: true, limit: null },
    ai_assistant: { featureKey: 'ai_assistant', enabled: true, limit: 2000 },
    ocr_search: { featureKey: 'ocr_search', enabled: true, limit: null },
    max_storage_mb: { featureKey: 'max_storage_mb', enabled: true, limit: 102400 },
    max_audio_minutes: { featureKey: 'max_audio_minutes', enabled: true, limit: null },
    export_pdf: { featureKey: 'export_pdf', enabled: true, limit: null },
    team_collaboration: { featureKey: 'team_collaboration', enabled: true, limit: null },
  },
};

DEFAULT_PLAN_ENTITLEMENTS.pro_monthly = DEFAULT_PLAN_ENTITLEMENTS.pro;
DEFAULT_PLAN_ENTITLEMENTS.pro_yearly = DEFAULT_PLAN_ENTITLEMENTS.pro;

// ==============================================================================
// Regional Detection & Student Verification Helpers
// ==============================================================================

/**
 * Auto-detects whether the user is in Sri Lanka to default to LKR via PayHere,
 * or outside to default to USD via Stripe.
 */
export function detectUserRegion(): {
  currency: 'USD' | 'LKR';
  provider: 'stripe' | 'payhere';
  isSriLanka: boolean;
} {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const locale = navigator.language || '';

    const isLKR =
      timeZone.includes('Colombo') ||
      timeZone.includes('Sri_Lanka') ||
      locale.toLowerCase().includes('lk') ||
      locale.toLowerCase().includes('si') ||
      locale.toLowerCase().includes('ta');

    if (isLKR) {
      return { currency: 'LKR', provider: 'payhere', isSriLanka: true };
    }
  } catch {
    // fallback
  }

  return { currency: 'USD', provider: 'stripe', isSriLanka: false };
}

/**
 * Validates whether an email belongs to an educational institution (.edu, .ac.lk, .edu.*)
 */
export function isEducationalEmail(email: string): boolean {
  if (!email || !email.includes('@')) return false;
  const domain = email.toLowerCase().split('@')[1];
  return (
    domain.endsWith('.edu') ||
    domain.endsWith('.ac.lk') ||
    domain.includes('.edu.') ||
    domain.includes('.ac.') ||
    domain.endsWith('.sch.lk')
  );
}

/**
 * Checks if a feature is enabled for the user based on active subscription or active trial.
 */
export function checkCanAccessFeature(
  featureKey: FeatureKey,
  subscription: Subscription | null,
  trial: TrialInfo | null,
  dynamicEntitlements: Record<PlanId, Record<FeatureKey, PlanFeatureLimit>> = DEFAULT_PLAN_ENTITLEMENTS
): boolean {
  // If user is actively trialing, grant Pro privileges
  if (trial && trial.isTrialActive && trial.daysRemaining > 0) {
    const proConfig = dynamicEntitlements.pro[featureKey];
    return proConfig ? proConfig.enabled : true;
  }

  // Active paid subscription
  if (subscription && (subscription.status === 'active' || subscription.status === 'trialing')) {
    const mappedPlan = subscription.planId === 'pro_monthly' || subscription.planId === 'pro_yearly'
      ? 'pro'
      : subscription.planId;
    const planConfig = dynamicEntitlements[mappedPlan]?.[featureKey];
    return planConfig ? planConfig.enabled : false;
  }

  // Fallback to Free Plan
  const freeConfig = dynamicEntitlements.free[featureKey];
  return freeConfig ? freeConfig.enabled : false;
}

/**
 * Gets the numeric limit for a feature (e.g. storage MB, max audio mins). Returns null if unlimited.
 */
export function getFeatureLimit(
  featureKey: FeatureKey,
  subscription: Subscription | null,
  trial: TrialInfo | null,
  dynamicEntitlements: Record<PlanId, Record<FeatureKey, PlanFeatureLimit>> = DEFAULT_PLAN_ENTITLEMENTS
): number | null {
  if (trial && trial.isTrialActive && trial.daysRemaining > 0) {
    return dynamicEntitlements.pro[featureKey]?.limit ?? null;
  }

  if (subscription && (subscription.status === 'active' || subscription.status === 'trialing')) {
    const mappedPlan = subscription.planId === 'pro_monthly' || subscription.planId === 'pro_yearly'
      ? 'pro'
      : subscription.planId;
    return dynamicEntitlements[mappedPlan]?.[featureKey]?.limit ?? null;
  }

  return dynamicEntitlements.free[featureKey]?.limit ?? null;
}

// ==============================================================================
// Feature Catalog Metadata (For Comparison Table & Admin Management)
// ==============================================================================

export interface FeatureMetadata {
  key: FeatureKey;
  label: string;
  category: 'Workspace & Storage' | 'Canvas & Tools' | 'Media & Notes' | 'AI & Intelligence' | 'Export & Collab';
  description: string;
}

export const FEATURE_CATALOG: FeatureMetadata[] = [
  { key: 'notes_count', label: 'Notes Count', category: 'Workspace & Storage', description: 'Total number of active lecture notes' },
  { key: 'notebooks_count', label: 'Notebooks / Courses', category: 'Workspace & Storage', description: 'Folders/notebooks to organize subjects' },
  { key: 'storage_mb', label: 'Storage Allocation', category: 'Workspace & Storage', description: 'Total disk & cloud attachment quota' },
  { key: 'cloud_sync', label: 'Multi-Device Cloud Sync', category: 'Workspace & Storage', description: 'Instant sync across iPad, Mac, Windows, Android' },
  { key: 'devices', label: 'Connected Devices', category: 'Workspace & Storage', description: 'Simultaneous active synced logins' },

  { key: 'canvas_basic_tools', label: 'Basic Canvas Tools', category: 'Canvas & Tools', description: 'Pen, highlighter, eraser, basic shapes' },
  { key: 'canvas_advanced', label: 'Advanced Canvas Tools', category: 'Canvas & Tools', description: 'Lasso, layers, shape recognition, all grids, custom presets' },
  { key: 'themes_accents', label: 'Themes & Accents', category: 'Canvas & Tools', description: 'Apple dark mode & custom accent colors' },

  { key: 'pdf_import_annotate', label: 'PDF Slide Annotation', category: 'Media & Notes', description: 'Import and markup lecture slides and textbooks' },
  { key: 'audio_record_minutes_per_note', label: 'Audio Record Limit', category: 'Media & Notes', description: 'Voice memo recording minutes per note' },
  { key: 'audio_synced_notes', label: 'Audio-Synced Notes', category: 'Media & Notes', description: 'Click any stroke or text to jump audio to that exact moment' },
  { key: 'ocr_handwriting_search', label: 'OCR & Handwriting Search', category: 'Media & Notes', description: 'Search inside handwritten formulas and sketches' },

  { key: 'ai_assistant_messages_per_month', label: 'AI Assistant Messages', category: 'AI & Intelligence', description: 'Chat queries with context-aware Study Assistant' },
  { key: 'ai_flashcards_quiz', label: 'AI Flashcards & Quizzes', category: 'AI & Intelligence', description: 'Automatic generation of Anki-compatible study decks' },

  { key: 'version_history_days', label: 'Version History Retention', category: 'Export & Collab', description: 'Time-travel snapshots of lecture changes' },
  { key: 'export_formats', label: 'Export Formats', category: 'Export & Collab', description: 'PNG, SVG, PDF, Markdown, JSON, Full Backup' },
  { key: 'share_links', label: 'Public Web Share Links', category: 'Export & Collab', description: 'Share view-only lecture notes via secure link' },
  { key: 'collaboration', label: 'Real-Time Collaboration', category: 'Export & Collab', description: 'Multiplayer canvas with course study pods' },
  { key: 'priority_support', label: 'Support SLA', category: 'Export & Collab', description: 'Community vs 24/7 priority support' },
];

export function formatFeatureDisplay(
  feature: FeatureKey,
  limitObj?: PlanFeatureLimit
): string {
  if (!limitObj) return '—';
  if (limitObj.customNote) return limitObj.customNote;
  if (!limitObj.enabled) return 'Off';

  if (limitObj.limit === null) return 'Unlimited';

  switch (feature) {
    case 'storage_mb':
      return limitObj.limit >= 1024 ? `${Math.round(limitObj.limit / 1024)} GB` : `${limitObj.limit} MB`;
    case 'audio_record_minutes_per_note':
      return `${limitObj.limit} min`;
    case 'ai_assistant_messages_per_month':
      return `${limitObj.limit} / mo`;
    case 'ai_flashcards_quiz':
      return `${limitObj.limit} sets / mo`;
    case 'version_history_days':
      return limitObj.limit === 0 ? 'None' : `${limitObj.limit} days`;
    case 'pdf_import_annotate':
      return `${limitObj.limit} file`;
    case 'export_formats':
      return `${limitObj.limit} formats`;
    case 'themes_accents':
      return `${limitObj.limit} accents`;
    default:
      return `${limitObj.limit}`;
  }
}
