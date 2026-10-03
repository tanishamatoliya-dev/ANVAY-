import React from 'react';
import { useEntitlement } from '../../hooks/useEntitlement';
import { Crown, Check, ShieldCheck, Zap } from 'lucide-react';
import { api } from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

export const SubscriptionPage: React.FC = () => {
  const { entitlements, refetch } = useEntitlement();
  const { refreshUser } = useAuth();

  const handleSelectTier = async (tier: string) => {
    try {
      await api.put('/therapists/profile', { subscriptionPlan: tier });
      await refetch();
      await refreshUser();
      alert(`Subscription plan updated to ${tier.toUpperCase()}.`);
    } catch (e: any) {
      alert(e.message || 'Failed to update plan');
    }
  };

  const plans = [
    {
      tier: 'starter',
      name: 'Starter Solo',
      price: 29,
      subtitle: 'For independent practitioners starting their caseload.',
      clients: '15 Active Clients',
      appointments: '40 Monthly Appointments',
      features: [
        'Branded Public Booking Link',
        'Conflict-Free Scheduling & Buffers',
        'Encrypted SOAP Notes',
        'Razorpay Payment Processing',
        'Client Self-Service Portal',
      ],
      notIncluded: [
        'Practice Analytics & Trends',
        'AI Clinical SOAP & Intake Assistant',
        'Priority Phone Support',
      ],
    },
    {
      tier: 'professional',
      name: 'Professional Practice',
      price: 69,
      popular: true,
      subtitle: 'For established solo practitioners with active caseloads.',
      clients: '65 Active Clients',
      appointments: '200 Monthly Appointments',
      features: [
        'Everything in Starter Solo',
        'Full Practice Analytics & Metrics',
        'AI Clinical Assistant (SOAP & Intake)',
        'Custom Intake Questionnaires',
        'Automated Invoicing & Receipts',
        'Direct Client Chat Channel',
      ],
      notIncluded: ['Multi-Clinic Support'],
    },
    {
      tier: 'practice',
      name: 'Clinical Master',
      price: 149,
      subtitle: 'For high-volume practices and comprehensive care.',
      clients: 'Unlimited Clients',
      appointments: 'Unlimited Appointments',
      features: [
        'Everything in Professional',
        'Unlimited Active Patients',
        'Unlimited Monthly Appointments',
        'Priority Clinical Concierge Support',
        'Custom Domain & Whitelabel Branding',
        'Dedicated Practice Data Export',
      ],
      notIncluded: [],
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="border-b border-[#e7e5dc] pb-6">
        <span className="text-[11px] uppercase font-bold tracking-widest text-[#727f77] block mb-1">
          Governance & Access
        </span>
        <h1 className="font-serif-editorial text-3xl font-medium tracking-tight text-[#1e2321]">
          Subscription & Practice Tier
        </h1>
        <p className="text-xs text-[#5e6b63] mt-1">
          Centralized entitlement system controlling client volume and clinical capabilities.
        </p>
      </div>

      {/* Current Tier & Meters Card */}
      {entitlements && (
        <div className="p-6 bg-[#f8f7f2] border border-[#ded9cc] rounded space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#6e7b73] block mb-0.5">
                Current Plan
              </span>
              <h3 className="font-serif-editorial text-2xl font-bold text-[#1e2321]">
                {entitlements.planName}
              </h3>
              <p className="text-xs text-[#627068]">
                Billed monthly at ${entitlements.monthlyPrice}/month via Razorpay Subscription.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#1e2321] text-white text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Active Standing</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#e5e1d4]">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-[#1e2321]">
                <span>Active Clients</span>
                <span>
                  {entitlements.usage.activeClients} / {entitlements.limits.maxClients === 999999 ? 'Unlimited' : entitlements.limits.maxClients}
                </span>
              </div>
              <div className="w-full bg-[#ded9cd] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#2a362f] h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, entitlements.usage.clientUsagePercent)}%` }}
                />
              </div>
              <span className="text-[10px] text-[#717d76] block">
                {entitlements.usage.clientUsagePercent}% of plan client capacity used.
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-[#1e2321]">
                <span>Practice Features Unlocked</span>
                <span>
                  {Object.values(entitlements.features).filter(Boolean).length} / 5 Modules
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className={`px-2 py-0.5 rounded text-[10px] ${entitlements.features.analytics ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                  Analytics {entitlements.features.analytics ? '✓' : '✗'}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] ${entitlements.features.aiAssistant ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                  AI Assistant {entitlements.features.aiAssistant ? '✓' : '✗'}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] ${entitlements.features.customIntake ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                  Custom Intake {entitlements.features.customIntake ? '✓' : '✗'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => {
          const isCurrent = entitlements?.plan === p.tier;
          return (
            <div
              key={p.tier}
              className={`p-6 bg-white border rounded flex flex-col justify-between transition-shadow text-xs ${
                isCurrent
                  ? 'border-[#1e2321] ring-1 ring-[#1e2321] shadow-xs'
                  : 'border-[#dedad0] hover:border-[#bdb7a9]'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-serif-editorial text-xl font-bold text-[#1e2321]">
                    {p.name}
                  </span>
                  {p.popular && (
                    <span className="px-2 py-0.5 rounded bg-[#f0ece2] border border-[#dcd6c8] text-[10px] font-semibold text-[#3b473f]">
                      Recommended
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-[#6a766f]">{p.subtitle}</p>

                <div className="flex items-baseline gap-1 border-b border-[#f0ece2] pb-4">
                  <span className="font-serif text-3xl font-bold text-[#1e2321]">
                    ${p.price}
                  </span>
                  <span className="text-xs text-[#717c76]">/ month</span>
                </div>

                <div className="space-y-2 font-medium text-[#2d3831]">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                    <span>{p.clients}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                    <span>{p.appointments}</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[#f0ece2]">
                  <span className="text-[10px] uppercase font-semibold text-[#7e8983] block mb-1">
                    Features Included
                  </span>
                  {p.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-[#4c5951] text-[11px]">
                      <span className="text-emerald-700 font-bold">•</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleSelectTier(p.tier)}
                  disabled={isCurrent}
                  className={`w-full py-2.5 rounded text-xs font-semibold transition-colors ${
                    isCurrent
                      ? 'bg-[#f0ece2] text-[#425046] cursor-default'
                      : 'bg-[#1e2321] text-white hover:bg-[#2e3732] shadow-xs'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : `Switch to ${p.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
