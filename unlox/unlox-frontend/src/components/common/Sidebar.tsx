import React from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  CreditCard,
  BarChart3,
  MessageSquare,
  UserCog,
  Crown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEntitlement } from '../../hooks/useEntitlement';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenAIModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onNavigate, onOpenAIModal }) => {
  const { user } = useAuth();
  const { entitlements } = useEntitlement();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'notes', label: 'Clinical Notes', icon: FileText },
    { id: 'payments', label: 'Billing & Invoices', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'Therapist Profile', icon: UserCog },
    { id: 'subscription', label: 'Subscription & Tier', icon: Crown },
  ];

  return (
    <aside className="w-64 border-r border-[#e7e5dc] bg-[#faf9f6] flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        {/* Navigation Section */}
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#858f88] px-3 block mb-2">
            Practice Management
          </span>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded transition-colors text-left ${
                    isActive
                      ? 'bg-[#1e2321] text-white shadow-xs font-semibold'
                      : 'text-[#48534d] hover:bg-[#f0ede4] hover:text-[#1e2321]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#6b7670]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* AI Clinical Assistant Trigger */}
        {onOpenAIModal && (
          <div className="pt-2">
            <button
              onClick={onOpenAIModal}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-[#f2efe6] hover:bg-[#eae6db] border border-[#ded8cb] rounded text-left transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#44564b]" />
                <div>
                  <span className="text-xs font-semibold text-[#1e2321] block">AI Clinical Assistant</span>
                  <span className="text-[10px] text-[#69746e] block">SOAP drafts & intake summaries</span>
                </div>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#e3ded2] text-[#36423b] font-medium">
                Tools
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Subscription Tier Meter in Footer of Sidebar */}
      {entitlements && (
        <div className="p-4 border-t border-[#e7e5dc] bg-[#f5f3ec]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-[#1e2321] capitalize">
              {entitlements.planName}
            </span>
            <span className="text-[10px] text-[#6a746f] font-mono">
              ${entitlements.monthlyPrice}/mo
            </span>
          </div>

          {/* Client Limit Meter */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-[#55605a]">
              <span>Active Clients</span>
              <span className="font-medium">
                {entitlements.usage.activeClients} / {entitlements.limits.maxClients === 999999 ? '∞' : entitlements.limits.maxClients}
              </span>
            </div>
            <div className="w-full bg-[#e3dfd3] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#38483e] h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, entitlements.usage.clientUsagePercent)}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => onNavigate('subscription')}
            className="mt-3 w-full text-center text-[11px] font-medium text-[#2d3831] hover:text-[#111614] hover:underline block"
          >
            Manage Tier & Entitlements →
          </button>
        </div>
      )}
    </aside>
  );
};
