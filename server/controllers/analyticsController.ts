import { Response } from 'express';
import { db } from '../store/dbStore.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { entitlementService } from '../services/entitlementService.js';

export async function getAnalytics(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'therapist') {
      return res.status(403).json({ error: 'Forbidden', message: 'Therapist access required.' });
    }

    const therapist = await db.therapists.findOne({ userId: req.user.id });
    if (!therapist) return res.status(404).json({ error: 'NotFound', message: 'Therapist not found.' });

    const therapistId = therapist._id || therapist.id;

    // Entitlement check
    const canView = await entitlementService.canUseAnalytics(therapistId);
    if (!canView) {
      return res.status(403).json({
        error: 'FeatureNotAvailable',
        message: 'Practice Analytics requires the Professional or Practice plan.',
      });
    }

    const appointments = await db.appointments.find({ therapistId });
    const payments = await db.payments.find({ therapistId, status: 'captured' });
    const clients = await db.clients.find({ therapistId, status: 'active' });

    const totalRevenue = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const completedCount = appointments.filter((a: any) => a.status === 'completed').length;
    const now = new Date().toISOString();
    const upcomingCount = appointments.filter((a: any) => a.startTime >= now && a.status !== 'cancelled').length;

    // Group appointments by month from real data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyApptCounts: Record<string, number> = {};
    const monthlyRevenueCounts: Record<string, number> = {};

    for (const appt of appointments) {
      if (!appt.startTime) continue;
      const d = new Date(appt.startTime);
      const m = monthNames[d.getMonth()];
      monthlyApptCounts[m] = (monthlyApptCounts[m] || 0) + 1;
    }

    for (const p of payments) {
      if (!p.createdAt) continue;
      const d = new Date(p.createdAt);
      const m = monthNames[d.getMonth()];
      monthlyRevenueCounts[m] = (monthlyRevenueCounts[m] || 0) + p.amount;
    }

    const apptChartData = Object.entries(monthlyApptCounts).map(([month, count]) => ({
      month,
      sessions: count,
    }));

    const revenueChartData = Object.entries(monthlyRevenueCounts).map(([month, amount]) => ({
      month,
      revenue: amount,
    }));

    // Session type breakdown
    const typeDistribution: Record<string, number> = {};
    for (const a of appointments) {
      const t = a.type || 'Standard Session';
      typeDistribution[t] = (typeDistribution[t] || 0) + 1;
    }

    const sessionTypeData = Object.entries(typeDistribution).map(([name, value]) => ({
      name,
      value,
    }));

    const hasSufficientData = appointments.length > 0 || payments.length > 0;

    res.json({
      hasSufficientData,
      summary: {
        totalRevenue,
        activeClients: clients.length,
        totalAppointments: appointments.length,
        completedAppointments: completedCount,
        upcomingAppointments: upcomingCount,
      },
      apptChartData,
      revenueChartData,
      sessionTypeData,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'AnalyticsError', message: err.message });
  }
}
