import { useState, useEffect } from 'react';
import { api } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

export interface EntitlementSummary {
  plan: 'starter' | 'professional' | 'practice';
  planName: string;
  monthlyPrice: number;
  limits: {
    maxClients: number;
    maxMonthlyAppointments: number;
    canUseAnalytics: boolean;
    canUseAIAssistant: boolean;
    canUseCustomIntake: boolean;
    canExportReports: boolean;
    canUsePrioritySupport: boolean;
  };
  usage: {
    activeClients: number;
    maxClients: number;
    clientUsagePercent: number;
    totalAppointments: number;
  };
  features: {
    analytics: boolean;
    aiAssistant: boolean;
    customIntake: boolean;
    exportReports: boolean;
    prioritySupport: boolean;
  };
  availablePlans: any[];
}

export function useEntitlement() {
  const { user } = useAuth();
  const [entitlements, setEntitlements] = useState<EntitlementSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntitlements = async () => {
    if (!user || user.role !== 'therapist') {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data: any = await api.get('/therapists/entitlements');
      setEntitlements(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load plan entitlements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntitlements();
  }, [user]);

  const canAccess = (feature: 'analytics' | 'aiAssistant' | 'customIntake' | 'exportReports' | 'prioritySupport'): boolean => {
    if (!entitlements) return false;
    return Boolean(entitlements.features[feature]);
  };

  return {
    entitlements,
    loading,
    error,
    refetch: fetchEntitlements,
    canAccess,
    isClientLimitReached: entitlements ? entitlements.usage.activeClients >= entitlements.limits.maxClients : false,
  };
}
