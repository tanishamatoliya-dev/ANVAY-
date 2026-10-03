import { db } from '../store/dbStore.js';

export type PlanTier = 'starter' | 'professional' | 'practice';

export interface PlanConfig {
  tier: PlanTier;
  displayName: string;
  monthlyPrice: number;
  maxClients: number;
  maxMonthlyAppointments: number;
  canUseAnalytics: boolean;
  canUseAIAssistant: boolean;
  canUseCustomIntake: boolean;
  canExportReports: boolean;
  canUsePrioritySupport: boolean;
}

export const PLAN_CONFIGS: Record<PlanTier, PlanConfig> = {
  starter: {
    tier: 'starter',
    displayName: 'Starter Solo',
    monthlyPrice: 29,
    maxClients: 15,
    maxMonthlyAppointments: 40,
    canUseAnalytics: false,
    canUseAIAssistant: false,
    canUseCustomIntake: false,
    canExportReports: false,
    canUsePrioritySupport: false,
  },
  professional: {
    tier: 'professional',
    displayName: 'Professional Practice',
    monthlyPrice: 69,
    maxClients: 65,
    maxMonthlyAppointments: 200,
    canUseAnalytics: true,
    canUseAIAssistant: true,
    canUseCustomIntake: true,
    canExportReports: true,
    canUsePrioritySupport: false,
  },
  practice: {
    tier: 'practice',
    displayName: 'Clinical Master',
    monthlyPrice: 149,
    maxClients: 999999, // unlimited
    maxMonthlyAppointments: 999999,
    canUseAnalytics: true,
    canUseAIAssistant: true,
    canUseCustomIntake: true,
    canExportReports: true,
    canUsePrioritySupport: true,
  },
};

export class EntitlementService {
  async getTherapistPlan(therapistId: string): Promise<PlanTier> {
    const therapist = await db.therapists.findById(therapistId);
    if (!therapist) return 'starter';
    const sub = await db.subscriptions.findOne({ therapistId });
    if (sub && sub.status === 'active') {
      return (sub.plan as PlanTier) || 'professional';
    }
    return (therapist.subscriptionPlan as PlanTier) || 'professional';
  }

  async getPlanLimits(therapistId: string): Promise<PlanConfig> {
    const plan = await this.getTherapistPlan(therapistId);
    return PLAN_CONFIGS[plan] || PLAN_CONFIGS.professional;
  }

  async canAccessFeature(
    therapistId: string,
    feature: keyof Omit<PlanConfig, 'tier' | 'displayName' | 'monthlyPrice' | 'maxClients' | 'maxMonthlyAppointments'>
  ): Promise<boolean> {
    const limits = await this.getPlanLimits(therapistId);
    return Boolean(limits[feature]);
  }

  async canCreateClient(therapistId: string): Promise<{ allowed: boolean; currentCount: number; maxLimit: number; reason?: string }> {
    const limits = await this.getPlanLimits(therapistId);
    const currentCount = await db.clients.count({ therapistId, status: 'active' });
    if (currentCount >= limits.maxClients) {
      return {
        allowed: false,
        currentCount,
        maxLimit: limits.maxClients,
        reason: `Your ${limits.displayName} plan allows up to ${limits.maxClients} active clients. Please upgrade to add more clients.`,
      };
    }
    return { allowed: true, currentCount, maxLimit: limits.maxClients };
  }

  async canCreateAppointment(therapistId: string): Promise<{ allowed: boolean; currentMonthCount: number; maxLimit: number; reason?: string }> {
    const limits = await this.getPlanLimits(therapistId);
    // Count appointments created this calendar month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const appointments = await db.appointments.find({
      therapistId,
      status: { $ne: 'cancelled' },
    });
    const monthlyCount = appointments.filter((a: any) => new Date(a.startTime) >= startOfMonth).length;

    if (monthlyCount >= limits.maxMonthlyAppointments) {
      return {
        allowed: false,
        currentMonthCount: monthlyCount,
        maxLimit: limits.maxMonthlyAppointments,
        reason: `Monthly appointment limit of ${limits.maxMonthlyAppointments} reached for ${limits.displayName}.`,
      };
    }
    return { allowed: true, currentMonthCount: monthlyCount, maxLimit: limits.maxMonthlyAppointments };
  }

  async canUseAnalytics(therapistId: string): Promise<boolean> {
    return this.canAccessFeature(therapistId, 'canUseAnalytics');
  }

  async canUseAIAssistant(therapistId: string): Promise<boolean> {
    return this.canAccessFeature(therapistId, 'canUseAIAssistant');
  }

  async getEntitlementsSummary(therapistId: string) {
    const plan = await this.getTherapistPlan(therapistId);
    const config = PLAN_CONFIGS[plan];
    const clientCount = await db.clients.count({ therapistId, status: 'active' });
    const appointmentCount = await db.appointments.count({ therapistId });

    return {
      plan,
      planName: config.displayName,
      monthlyPrice: config.monthlyPrice,
      limits: config,
      usage: {
        activeClients: clientCount,
        maxClients: config.maxClients,
        clientUsagePercent: Math.min(100, Math.round((clientCount / config.maxClients) * 100)),
        totalAppointments: appointmentCount,
      },
      features: {
        analytics: config.canUseAnalytics,
        aiAssistant: config.canUseAIAssistant,
        customIntake: config.canUseCustomIntake,
        exportReports: config.canExportReports,
        prioritySupport: config.canUsePrioritySupport,
      },
      availablePlans: Object.values(PLAN_CONFIGS),
    };
  }
}

export const entitlementService = new EntitlementService();
