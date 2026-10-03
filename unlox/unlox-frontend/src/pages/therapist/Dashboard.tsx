import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/axiosInstance';
import {
  Calendar,
  Users,
  FileText,
  CreditCard,
  Clock,
  Video,
  ChevronRight,
  Sparkles,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onOpenAddClient: () => void;
  onOpenBookAppointment: () => void;
  onOpenCreateNote: () => void;
  onOpenAIModal: () => void;
  onSelectClient: (client: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenAddClient,
  onOpenBookAppointment,
  onOpenCreateNote,
  onOpenAIModal,
  onSelectClient,
}) => {
  const { user, therapist } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [apptRes, clientRes, invRes]: any = await Promise.all([
        api.get('/appointments'),
        api.get('/clients'),
        api.get('/invoices'),
      ]);
      setAppointments(apptRes || []);
      setClients(clientRes || []);
      setInvoices(invRes || []);
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.startTime?.startsWith(todayStr));
  const upcomingAppointments = appointments
    .filter((a) => new Date(a.startTime).getTime() > Date.now() && !a.startTime.startsWith(todayStr))
    .slice(0, 4);

  const pendingIntakes = clients.filter((c) => c.intakeStatus === 'pending');
  const paidInvoices = invoices.filter((i) => i.status === 'paid');
  const totalSettledRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Editorial Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e7e5dc] pb-6">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-widest text-[#727f77] block mb-1">
            Clinical Practice Overview
          </span>
          <h1 className="font-serif-editorial text-3xl sm:text-4xl font-medium tracking-tight text-[#1e2321]">
            {therapist?.professionalName || user?.name || 'Therapist Dashboard'}
          </h1>
          <p className="text-xs text-[#5e6b63] mt-1">
            {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} • {therapist?.timezone || 'America/New_York'}
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenBookAppointment}
            className="px-3.5 py-2 text-xs font-medium text-white bg-[#1e2321] hover:bg-[#2c3630] rounded shadow-xs transition-colors"
          >
            + Schedule Session
          </button>
          <button
            onClick={onOpenAddClient}
            className="px-3.5 py-2 text-xs font-medium text-[#2d3931] bg-[#f2efe6] hover:bg-[#eae5d8] border border-[#d8d3c5] rounded transition-colors"
          >
            + Add Client
          </button>
          <button
            onClick={onOpenCreateNote}
            className="px-3.5 py-2 text-xs font-medium text-[#2d3931] bg-[#f2efe6] hover:bg-[#eae5d8] border border-[#d8d3c5] rounded transition-colors hidden sm:inline-block"
          >
            SOAP Note
          </button>
          <button
            onClick={onOpenAIModal}
            className="px-3 py-2 text-xs font-medium text-[#2f4236] bg-[#eef3f0] hover:bg-[#e4ede7] border border-[#cfded4] rounded transition-colors flex items-center gap-1.5"
            title="Open AI Clinical Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-800" />
            <span>AI Tools</span>
          </button>
        </div>
      </div>

      {/* Main Grid Hierarchy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Schedule & Client Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule Card */}
          <div className="bg-[#fdfdfc] border border-[#e2dfd5] rounded shadow-xs p-5">
            <div className="flex items-center justify-between mb-4 border-b border-[#eeebe3] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#44534a]" />
                <h3 className="font-serif-editorial text-lg font-semibold text-[#1e2321]">
                  Today's Scheduled Consultations
                </h3>
              </div>
              <span className="text-xs font-medium text-[#5a6760]">
                {todayAppointments.length} {todayAppointments.length === 1 ? 'Session' : 'Sessions'}
              </span>
            </div>

            {todayAppointments.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#717b75]">
                No appointments scheduled for today.
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((appt) => (
                  <div
                    key={appt._id || appt.id}
                    className="p-3.5 bg-[#faf9f6] border border-[#dedad0] rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-xs font-semibold text-[#1e2321]">
                          {new Date(appt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(appt.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="px-2 py-0.2 rounded text-[10px] uppercase font-semibold bg-emerald-100 text-emerald-800">
                          {appt.status}
                        </span>
                      </div>
                      <span className="font-semibold text-sm text-[#1e2321] block">
                        {appt.clientName}
                      </span>
                      <span className="text-[11px] text-[#637068]">
                        {appt.type} • {appt.durationMinutes} mins ({appt.location})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {appt.meetingLink && (
                        <a
                          href={appt.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-[#1e2321] text-white rounded text-xs font-medium flex items-center gap-1.5 hover:bg-[#2c3631]"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Telehealth</span>
                        </a>
                      )}
                      <button
                        onClick={onOpenCreateNote}
                        className="px-3 py-1.5 bg-white border border-[#cfcbc0] text-[#334037] rounded text-xs font-medium hover:bg-[#f5f3ec]"
                      >
                        Note
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Schedule */}
          <div className="bg-[#fdfdfc] border border-[#e2dfd5] rounded shadow-xs p-5">
            <div className="flex items-center justify-between mb-4 border-b border-[#eeebe3] pb-3">
              <h3 className="font-serif-editorial text-lg font-semibold text-[#1e2321]">
                Upcoming Appointments This Week
              </h3>
              <button
                onClick={() => onNavigate('schedule')}
                className="text-xs text-[#4b5950] hover:text-[#1e2321] hover:underline flex items-center gap-1"
              >
                <span>View Full Calendar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#717b75]">
                No upcoming sessions scheduled after today.
              </div>
            ) : (
              <div className="divide-y divide-[#f0ede4]">
                {upcomingAppointments.map((appt) => (
                  <div
                    key={appt._id || appt.id}
                    className="py-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-[#1e2321] block">{appt.clientName}</span>
                      <span className="text-[11px] text-[#637068]">
                        {new Date(appt.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} • {appt.type}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-semibold text-[#1e2321]">
                      ${appt.fee}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Client Overview & Financial Summary */}
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="p-5 bg-[#f8f7f2] border border-[#ded9cb] rounded space-y-4">
            <h4 className="font-serif-editorial text-base font-semibold text-[#1e2321]">
              Practice Pulse
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-[#e5e1d6] rounded">
                <span className="text-[10px] uppercase font-semibold text-[#738078] block">
                  Active Clients
                </span>
                <span className="font-serif text-2xl font-bold text-[#1e2321] block mt-0.5">
                  {clients.length}
                </span>
              </div>

              <div className="p-3 bg-white border border-[#e5e1d6] rounded">
                <span className="text-[10px] uppercase font-semibold text-[#738078] block">
                  Settled Fees
                </span>
                <span className="font-serif text-2xl font-bold text-[#1e2321] block mt-0.5">
                  ${totalSettledRevenue}
                </span>
              </div>
            </div>

            {/* Pending Intakes Notice */}
            {pendingIntakes.length > 0 && (
              <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">
                    {pendingIntakes.length} Pending Intake {pendingIntakes.length === 1 ? 'Form' : 'Forms'}
                  </span>
                  <span className="text-[11px] text-amber-950/80">
                    Awaiting patient submission before upcoming evaluation.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Recent Clients Quick List */}
          <div className="bg-[#fdfdfc] border border-[#e2dfd5] rounded shadow-xs p-5">
            <div className="flex items-center justify-between mb-3 border-b border-[#eeebe3] pb-2">
              <h4 className="font-serif-editorial text-base font-semibold text-[#1e2321]">
                Recent Clients
              </h4>
              <button
                onClick={() => onNavigate('clients')}
                className="text-xs text-[#4b5950] hover:text-[#1e2321] hover:underline"
              >
                Directory →
              </button>
            </div>

            {clients.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#717b75]">
                No clients registered yet.
              </div>
            ) : (
              <div className="space-y-2">
                {clients.slice(0, 5).map((client) => (
                  <div
                    key={client._id || client.id}
                    onClick={() => onSelectClient(client)}
                    className="p-2.5 bg-[#faf9f6] hover:bg-[#f3f0e7] border border-[#e5e1d6] rounded cursor-pointer transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-[#1e2321] block">{client.name}</span>
                      <span className="text-[10px] text-[#6d7972]">{client.email}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-[#dedad0] text-[#4f5c53]">
                      {client.intakeStatus}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
