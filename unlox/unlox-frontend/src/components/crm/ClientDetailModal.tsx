import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../api/axiosInstance';
import {
  Calendar,
  CreditCard,
  FileText,
  Mail,
  Phone,
  User,
  Sparkles,
  Archive,
  Clock,
  ShieldAlert,
} from 'lucide-react';

interface ClientDetailModalProps {
  clientId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onClientUpdated: () => void;
  onOpenCreateNote?: (clientId: string) => void;
  onOpenBookAppointment?: (clientId: string, clientName: string) => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  clientId,
  isOpen,
  onClose,
  onClientUpdated,
  onOpenCreateNote,
  onOpenBookAppointment,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'appointments' | 'billing' | 'intake'>('overview');

  const fetchClientDetails = async () => {
    if (!clientId) return;
    try {
      setLoading(true);
      const res: any = await api.get(`/clients/${clientId}`);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && clientId) {
      fetchClientDetails();
      setActiveTab('overview');
    }
  }, [isOpen, clientId]);

  if (!isOpen || !clientId) return null;

  const client = data?.client;
  const notes = data?.notes || [];
  const appointments = data?.appointments || [];
  const invoices = data?.invoices || [];
  const intake = data?.intakeResponse;

  const handleArchive = async () => {
    try {
      await api.put(`/clients/${clientId}/archive`);
      onClientUpdated();
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={client?.name || 'Client Clinical Record'}
      subtitle={`Client ID: ${client?._id || client?.id || ''} • Added ${client ? new Date(client.createdAt).toLocaleDateString() : ''}`}
      maxWidth="max-w-4xl"
    >
      {loading ? (
        <div className="py-12 text-center text-xs text-[#6e7872]">
          Loading confidential clinical record...
        </div>
      ) : client ? (
        <div className="space-y-6">
          {/* Subheader Tabs */}
          <div className="flex border-b border-[#e2dfd5] text-xs gap-6">
            {(['overview', 'notes', 'appointments', 'billing', 'intake'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2.5 font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-[#1e2321] text-[#1e2321]'
                    : 'text-[#657069] hover:text-[#1e2321]'
                }`}
              >
                {tab === 'notes' ? `Clinical Notes (${notes.length})` : tab}
              </button>
            ))}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#f8f7f3] border border-[#e2dfd5] rounded">
                  <span className="text-[10px] uppercase tracking-wider text-[#79837d] font-semibold block mb-1">
                    Contact Details
                  </span>
                  <div className="space-y-1.5 text-xs text-[#2a342e]">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#6c7871]" />
                      <span>{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#6c7871]" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    {client.dateOfBirth && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#6c7871]" />
                        <span>DOB: {client.dateOfBirth}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-[#f8f7f3] border border-[#e2dfd5] rounded">
                  <span className="text-[10px] uppercase tracking-wider text-[#79837d] font-semibold block mb-1">
                    Clinical Status
                  </span>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#657069]">Directory Status:</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-100 text-emerald-800">
                        {client.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#657069]">Intake Form:</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-stone-200 text-stone-800">
                        {client.intakeStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#f8f7f3] border border-[#e2dfd5] rounded">
                  <span className="text-[10px] uppercase tracking-wider text-[#79837d] font-semibold block mb-1">
                    Tags & Modalities
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {client.tags?.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-white border border-[#dedad0] text-[11px] text-[#445049]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Private Therapist Notes */}
              {client.notes && (
                <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded">
                  <div className="flex items-center gap-1.5 text-amber-900 text-xs font-semibold mb-1">
                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                    <span>Confidential Initial Clinical Impressions (Therapist Only)</span>
                  </div>
                  <p className="text-xs text-amber-950/80 leading-relaxed whitespace-pre-line">
                    {client.notes}
                  </p>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => onOpenCreateNote && onOpenCreateNote(client._id || client.id)}
                  className="px-3.5 py-2 text-xs font-medium text-white bg-[#1e2321] hover:bg-[#2e3732] rounded shadow-xs"
                >
                  Create SOAP Session Note
                </button>
                <button
                  onClick={() => onOpenBookAppointment && onOpenBookAppointment(client._id || client.id, client.name)}
                  className="px-3.5 py-2 text-xs font-medium text-[#2d3731] bg-[#f2efe6] hover:bg-[#eae5d8] border border-[#dad4c5] rounded"
                >
                  Schedule Appointment
                </button>
                <button
                  onClick={handleArchive}
                  className="ml-auto text-xs text-[#7d8681] hover:text-[#991b1b] flex items-center gap-1.5"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>{client.status === 'archived' ? 'Unarchive Client' : 'Archive Client'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Clinical Notes */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#626e67]">
                  All session entries are encrypted and strictly confidential to the therapist.
                </p>
                <button
                  onClick={() => onOpenCreateNote && onOpenCreateNote(client._id || client.id)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-[#1e2321] rounded"
                >
                  + New Note
                </button>
              </div>

              {notes.length === 0 ? (
                <div className="p-8 border border-dashed border-[#dedad0] rounded text-center text-xs text-[#717b75]">
                  No session notes recorded for {client.name} yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.map((n: any) => (
                    <div key={n._id || n.id} className="p-4 bg-white border border-[#e2dfd5] rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-serif-editorial text-base font-semibold text-[#1e2321]">
                          {n.title}
                        </span>
                        <span className="text-[11px] text-[#717b75]">
                          Date: {n.sessionDate}
                        </span>
                      </div>
                      {n.subjective && (
                        <div className="mt-2 text-xs">
                          <strong className="text-[#3c4740]">Subjective:</strong>{' '}
                          <span className="text-[#55615a]">{n.subjective}</span>
                        </div>
                      )}
                      {n.objective && (
                        <div className="mt-1 text-xs">
                          <strong className="text-[#3c4740]">Objective:</strong>{' '}
                          <span className="text-[#55615a]">{n.objective}</span>
                        </div>
                      )}
                      {n.assessment && (
                        <div className="mt-1 text-xs">
                          <strong className="text-[#3c4740]">Assessment:</strong>{' '}
                          <span className="text-[#55615a]">{n.assessment}</span>
                        </div>
                      )}
                      {n.plan && (
                        <div className="mt-1 text-xs">
                          <strong className="text-[#3c4740]">Plan:</strong>{' '}
                          <span className="text-[#55615a]">{n.plan}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Appointments */}
          {activeTab === 'appointments' && (
            <div className="space-y-3">
              {appointments.length === 0 ? (
                <div className="p-8 border border-dashed border-[#dedad0] rounded text-center text-xs text-[#717b75]">
                  No appointment history for this client.
                </div>
              ) : (
                appointments.map((a: any) => (
                  <div
                    key={a._id || a.id}
                    className="p-3 bg-white border border-[#e2dfd5] rounded flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-[#1e2321] block">{a.type}</span>
                      <span className="text-[11px] text-[#636f68]">
                        {new Date(a.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} • {a.durationMinutes} min ({a.location})
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#f4f2ec] text-[#3e4a42]">
                        {a.status}
                      </span>
                      <span className="font-mono text-xs font-semibold text-[#1e2321]">
                        ${a.fee}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 4: Billing */}
          {activeTab === 'billing' && (
            <div className="space-y-3">
              {invoices.length === 0 ? (
                <div className="p-8 border border-dashed border-[#dedad0] rounded text-center text-xs text-[#717b75]">
                  No invoices or payments recorded.
                </div>
              ) : (
                invoices.map((inv: any) => (
                  <div
                    key={inv._id || inv.id}
                    className="p-3 bg-white border border-[#e2dfd5] rounded flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-[#1e2321] block">{inv.invoiceNumber}</span>
                      <span className="text-[11px] text-[#636f68]">
                        Issued: {inv.issueDate} • Due: {inv.dueDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-100 text-emerald-800">
                        {inv.status}
                      </span>
                      <span className="font-mono font-semibold text-xs text-[#1e2321]">
                        ${inv.amount} {inv.currency}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 5: Intake Form Submission */}
          {activeTab === 'intake' && (
            <div className="space-y-4 text-xs">
              {intake ? (
                <div className="space-y-4">
                  {intake.aiClinicalSummary && (
                    <div className="p-4 bg-[#f3f7f4] border border-[#cbe0d3] rounded">
                      <div className="flex items-center gap-1.5 text-[#244230] font-semibold mb-2">
                        <Sparkles className="w-4 h-4 text-[#39684b]" />
                        <span>AI Clinical Intake Summary (Therapist Review Draft)</span>
                      </div>
                      <p className="text-xs text-[#283e30] leading-relaxed whitespace-pre-line">
                        {intake.aiClinicalSummary}
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-white border border-[#dedad0] rounded space-y-3">
                    <span className="font-semibold text-[#1e2321] block">
                      Submitted Responses ({new Date(intake.submittedAt).toLocaleDateString()})
                    </span>
                    {Object.entries(intake.responses || {}).map(([question, ans], i) => (
                      <div key={i} className="border-t border-[#f0ede4] pt-2">
                        <span className="font-medium text-[#46534c] block mb-0.5">{question}</span>
                        <span className="text-[#1e2321]">{String(ans)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 border border-dashed border-[#dedad0] rounded text-center text-xs text-[#717b75]">
                  Intake form has not been submitted by this client yet.
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
};
