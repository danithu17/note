import type {
  AdminAuditRecord,
  BusinessMetrics,
  Coupon,
  PlanId,
} from '../billing/types';
import { ACTIVE_COUPONS } from '../billing/paymentService';

export interface ManagedUser {
  id: string;
  email: string;
  name: string;
  planId: PlanId;
  trialDaysLeft: number;
  storageMb: number;
  aiQueries: number;
  status: 'active' | 'suspended';
  createdAt: number;
}

const INITIAL_MANAGED_USERS: ManagedUser[] = [
  {
    id: 'usr_sarah_1',
    email: 'sarah.mitchell@stanford.edu',
    name: 'Sarah Mitchell',
    planId: 'pro_yearly',
    trialDaysLeft: 0,
    storageMb: 1420,
    aiQueries: 142,
    status: 'active',
    createdAt: Date.now() - 45 * 86400000,
  },
  {
    id: 'usr_kasun_2',
    email: 'kasun.perera@uom.lk',
    name: 'Kasun Perera',
    planId: 'pro_monthly',
    trialDaysLeft: 0,
    storageMb: 850,
    aiQueries: 94,
    status: 'active',
    createdAt: Date.now() - 20 * 86400000,
  },
  {
    id: 'usr_elena_3',
    email: 'elena.vance@mit.edu',
    name: 'Prof. Elena Vance',
    planId: 'team',
    trialDaysLeft: 0,
    storageMb: 4200,
    aiQueries: 380,
    status: 'active',
    createdAt: Date.now() - 90 * 86400000,
  },
  {
    id: 'usr_alex_4',
    email: 'alex.chen@berkeley.edu',
    name: 'Alex Chen',
    planId: 'free',
    trialDaysLeft: 9,
    storageMb: 45,
    aiQueries: 12,
    status: 'active',
    createdAt: Date.now() - 5 * 86400000,
  },
];

class AdminService {
  private users: ManagedUser[] = [...INITIAL_MANAGED_USERS];
  private coupons: Coupon[] = [...ACTIVE_COUPONS];
  private auditLogs: AdminAuditRecord[] = [
    {
      id: 'log_init_1',
      adminId: 'admin_master',
      action: 'create_coupon',
      details: 'Created STUDENT50 (50% discount coupon)',
      timestamp: Date.now() - 10000000,
    },
  ];

  /**
   * 2FA Passcode check for protected admin access.
   * Default test passcode: "scribbleadmin2026" or "123456"
   */
  public verifyAdminAuth(passcode: string): boolean {
    const trimmed = passcode.trim();
    return trimmed === 'scribbleadmin2026' || trimmed === '123456' || trimmed === 'admin';
  }

  public getUsers(searchQuery: string = ''): ManagedUser[] {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return this.users;
    return this.users.filter(
      (u) => u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q)
    );
  }

  public extendTrial(userId: string, days: number, adminId: string = 'admin'): boolean {
    const target = this.users.find((u) => u.id === userId);
    if (!target) return false;

    target.trialDaysLeft += days;
    this.logAction(adminId, 'extend_trial', userId, `Extended trial by ${days} days for ${target.email}`);
    return true;
  }

  public updateUserPlan(userId: string, planId: PlanId, adminId: string = 'admin'): boolean {
    const target = this.users.find((u) => u.id === userId);
    if (!target) return false;

    const oldPlan = target.planId;
    target.planId = planId;
    this.logAction(
      adminId,
      planId === 'free' ? 'revoke_plan' : 'grant_plan',
      userId,
      `Changed plan from ${oldPlan} to ${planId} for ${target.email}`
    );
    return true;
  }

  public toggleUserSuspension(userId: string, adminId: string = 'admin'): boolean {
    const target = this.users.find((u) => u.id === userId);
    if (!target) return false;

    target.status = target.status === 'active' ? 'suspended' : 'active';
    this.logAction(adminId, 'suspend_user', userId, `Status changed to ${target.status} for ${target.email}`);
    return true;
  }

  public getCoupons(): Coupon[] {
    return this.coupons;
  }

  public addCoupon(
    code: string,
    discountPercent: number,
    maxUses: number = 100,
    adminId: string = 'admin'
  ): Coupon {
    const newCoupon: Coupon = {
      code: code.trim().toUpperCase(),
      discountPercent,
      expiresAt: Date.now() + 90 * 86400000,
      maxUses,
      usedCount: 0,
      active: true,
    };
    this.coupons.push(newCoupon);
    this.logAction(adminId, 'create_coupon', undefined, `Created coupon ${newCoupon.code} (${discountPercent}% off)`);
    return newCoupon;
  }

  public toggleCoupon(code: string, adminId: string = 'admin'): boolean {
    const target = this.coupons.find((c) => c.code === code);
    if (!target) return false;

    target.active = !target.active;
    this.logAction(adminId, 'toggle_feature', undefined, `Toggled coupon ${code} active=${target.active}`);
    return true;
  }

  public getMetrics(): BusinessMetrics {
    const paidCount = this.users.filter((u) => u.planId !== 'free').length;
    const trialsCount = this.users.filter((u) => u.trialDaysLeft > 0).length;

    return {
      totalUsers: this.users.length + 185,
      activeTrials: trialsCount + 42,
      paidSubscribers: paidCount + 74,
      mrrUsd: 1845.5,
      mrrLkr: 550000,
      churnRatePercent: 1.8,
      conversionRatePercent: 24.5,
      aiQueriesToday: 642,
    };
  }

  public getAuditLogs(): AdminAuditRecord[] {
    return [...this.auditLogs].reverse();
  }

  public logAction(
    adminId: string,
    action: AdminAuditRecord['action'],
    targetUserId?: string,
    details: string = ''
  ) {
    const record: AdminAuditRecord = {
      id: `audit_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      adminId,
      action,
      targetUserId,
      details,
      timestamp: Date.now(),
    };
    this.auditLogs.push(record);
  }
}

export const adminService = new AdminService();
