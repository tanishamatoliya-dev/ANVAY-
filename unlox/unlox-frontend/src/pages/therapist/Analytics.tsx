import React, { useState, useEffect } from 'react';
import { api } from '../../api/axiosInstance';
import { AnalyticsCharts } from '../../components/analytics/AnalyticsCharts';
import { useEntitlement } from '../../hooks/useEntitlement';
import { Lock, Crown } from 'lucide-react';

interface AnalyticsPageProps {
  onNavigate?: (tab: string) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onNavigate }) => {
  const { canAccess, entitlements } = useEntitlement();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/analytics');
      setData(res);
    } catch (e) {
      console.error('Analytics load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canAccess('analytics')) {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [entitlements]);

  if (!canAccess('analytics')) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-[#fbf9f4] border border-[#dcd7cb] rounded text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#eee8db] border border-[#ded7c8] flex items-center justify-center mx-auto text-[#3f4d43]">
          <Lock className="w-5 h-5" />
        </div>
        <h3 className="font-serif-editorial text-2xl font-semibold text-[#1e2321]">
          Practice Analytics Gated
        </h3>
        <p className="text-xs text-[#5e6b63] leading-relaxed">
          Comprehensive clinical volume trends, revenue trajectories, and session type breakdowns require the Professional or Practice plan.
        </p>
        <button
          onClick={() => onNavigate && onNavigate('subscription')}
          className="inline-flex items-center gap-2 px-5 py-2 text-xs font-medium text-white bg-[#1e2321] hover:bg-[#2b3530] rounded shadow-xs"
        >
          <Crown className="w-3.5 h-3.5" />
          <span>View Subscription Tiers</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[#e7e5dc] pb-6">
        <span className="text-[11px] uppercase font-bold tracking-widest text-[#727f77] block mb-1">
          Practice Insights
        </span>
        <h1 className="font-serif-editorial text-3xl font-medium tracking-tight text-[#1e2321]">
          Clinical Analytics & Trends
        </h1>
        <p className="text-xs text-[#5e6b63] mt-1">
          Aggregated session counts and revenue metrics based strictly on database records.
        </p>
      </div>

      <AnalyticsCharts data={data} loading={loading} />
    </div>
  );
};
