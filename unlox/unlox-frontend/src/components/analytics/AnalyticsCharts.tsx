import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { EmptyState } from '../common/EmptyState';
import { BarChart3, TrendingUp, Users, CalendarCheck, DollarSign } from 'lucide-react';

interface AnalyticsData {
  hasSufficientData: boolean;
  summary: {
    totalRevenue: number;
    activeClients: number;
    totalAppointments: number;
    completedAppointments: number;
    upcomingAppointments: number;
  };
  apptChartData: Array<{ month: string; sessions: number }>;
  revenueChartData: Array<{ month: string; revenue: number }>;
  sessionTypeData: Array<{ name: string; value: number }>;
}

interface AnalyticsChartsProps {
  data: AnalyticsData | null;
  loading: boolean;
}

const COLORS = ['#2a362f', '#566a5e', '#889e90', '#c2bbaa', '#746253'];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-[#717c76]">
        Calculating practice metrics from database records...
      </div>
    );
  }

  if (!data || !data.hasSufficientData) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No Practice Analytics Yet"
        description="Analytics require verified session and billing history to generate reliable practice metrics. Complete sessions or record client invoices to view trends."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Editorial Key Metric Cards (Using Real Data Only) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#fdfdfc] border border-[#e2dfd5] rounded">
          <span className="text-[11px] uppercase tracking-wider text-[#6d7972] font-semibold block mb-1">
            Settled Revenue
          </span>
          <div className="font-serif text-2xl font-bold text-[#1e2321]">
            ${data.summary.totalRevenue.toLocaleString()}
          </div>
          <span className="text-[10px] text-[#7d8781] mt-1 block">
            Verified via Razorpay
          </span>
        </div>

        <div className="p-4 bg-[#fdfdfc] border border-[#e2dfd5] rounded">
          <span className="text-[11px] uppercase tracking-wider text-[#6d7972] font-semibold block mb-1">
            Active Clients
          </span>
          <div className="font-serif text-2xl font-bold text-[#1e2321]">
            {data.summary.activeClients}
          </div>
          <span className="text-[10px] text-[#7d8781] mt-1 block">
            In clinical directory
          </span>
        </div>

        <div className="p-4 bg-[#fdfdfc] border border-[#e2dfd5] rounded">
          <span className="text-[11px] uppercase tracking-wider text-[#6d7972] font-semibold block mb-1">
            Completed Sessions
          </span>
          <div className="font-serif text-2xl font-bold text-[#1e2321]">
            {data.summary.completedAppointments}
          </div>
          <span className="text-[10px] text-[#7d8781] mt-1 block">
            Documented encounters
          </span>
        </div>

        <div className="p-4 bg-[#fdfdfc] border border-[#e2dfd5] rounded">
          <span className="text-[11px] uppercase tracking-wider text-[#6d7972] font-semibold block mb-1">
            Upcoming Bookings
          </span>
          <div className="font-serif text-2xl font-bold text-[#1e2321]">
            {data.summary.upcomingAppointments}
          </div>
          <span className="text-[10px] text-[#7d8781] mt-1 block">
            Active on calendar
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions by Month */}
        <div className="p-5 bg-[#fdfdfc] border border-[#e2dfd5] rounded shadow-xs">
          <div className="mb-4">
            <h4 className="font-serif-editorial text-base font-semibold text-[#1e2321]">
              Completed Sessions by Month
            </h4>
            <p className="text-xs text-[#6e7a73]">Monthly patient consultation volume.</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.apptChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eeebe3" vertical={false} />
                <XAxis dataKey="month" stroke="#7e8983" fontSize={11} tickLine={false} />
                <YAxis stroke="#7e8983" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e2321',
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="sessions" fill="#2a362f" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Practice Revenue Over Time */}
        <div className="p-5 bg-[#fdfdfc] border border-[#e2dfd5] rounded shadow-xs">
          <div className="mb-4">
            <h4 className="font-serif-editorial text-base font-semibold text-[#1e2321]">
              Practice Revenue Trend ($ USD)
            </h4>
            <p className="text-xs text-[#6e7a73]">Actual collected patient session fees.</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eeebe3" vertical={false} />
                <XAxis dataKey="month" stroke="#7e8983" fontSize={11} tickLine={false} />
                <YAxis stroke="#7e8983" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e2321',
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`$${val}`, 'Revenue']}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#38493e"
                  strokeWidth={2}
                  dot={{ fill: '#38493e', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
