import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/axiosInstance';
import { ChatWindow } from '../../components/chat/ChatWindow';
import {
  Calendar,
  Video,
  FileText,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Download,
} from 'lucide-react';

export const ClientPortal: React.FC = () => {
  const { user, client } = useAuth();
  const [activeTab, setActiveTab] = useState<'appointments' | 'intake' | 'messages' | 'billing'>('appointments');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Digital Intake state
  const [intakeConcerns, setIntakeConcerns] = useState('Acute work-related burnout, sleep onset insomnia');
  const [intakeMedical, setIntakeMedical] = useState('No current psychiatric medications. Annual physical normal.');
  const [intakePriorTherapy, setIntakePriorTherapy] = useState('6 months CBT in 2023 for general anxiety');
  const [intakeGoals, setIntakeGoals] = useState('Develop sustainable workload boundaries and sleep hygiene techniques');
  const [emergencyName, setEmergencyName] = useState('Elena Ross');
  const [emergencyPhone, setEmergencyPhone] = useState('+1 (917) 555-8921');
  const [intakeSubmitted, setIntakeSubmitted] = useState(false);
  const [submittingIntake, setSubmittingIntake] = useState(false);

  const fetchClientPortalData = async () => {
    try {
      setLoading(true);
      const [apptRes, invRes]: any = await Promise.all([
        api.get('/appointments'),
        api.get('/invoices'),
      ]);
      setAppointments(apptRes || []);
      setInvoices(invRes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientPortalData();
  }, [user]);

  const handleSubmitIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    try {
      setSubmittingIntake(true);
      await api.post('/clients/intake/submit', {
        clientId: client._id || client.id,
        responses: {
          'Primary Presenting Concerns': intakeConcerns,
          'Medical & Medication Context': intakeMedical,
          'Prior Therapy Engagement': intakePriorTherapy,
          'Therapeutic Objectives & Goals': intakeGoals,
          'Emergency Contact Person': `${emergencyName} (${emergencyPhone})`,
        },
      });
      setIntakeSubmitted(true);
      fetchClientPortalData();
    } catch (e: any) {
      alert(e.message || 'Failed to submit intake');
    } finally {
      setSubmittingIntake(false);
    }
  };

  const therapistId = client?.therapistId || appointments[0]?.therapistId || 'therapist_default';
  const conversationId = `conv_${therapistId}_${client?._id || client?.id || 'client_id'}`;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e7e5dc] pb-6">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-widest text-[#727f77] block mb-1">
            Patient Portal
          </span>
          <h1 className="font-serif-editorial text-3xl font-medium tracking-tight text-[#1e2321]">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-[#5e6b63] mt-1">
            Access upcoming clinical sessions, submitted paperwork, and secure communication.
          </p>
        </div>

        {/* Portal Nav Tabs */}
        <div className="flex items-center gap-1.5 bg-[#f0ece2] p-0.5 rounded border border-[#d8d3c5] text-xs">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'appointments' ? 'bg-[#1e2321] text-white shadow-xs' : 'text-[#56635a]'
            }`}
          >
            Appointments
          </button>
          <button
            onClick={() => setActiveTab('intake')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'intake' ? 'bg-[#1e2321] text-white shadow-xs' : 'text-[#56635a]'
            }`}
          >
            Intake Form
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'messages' ? 'bg-[#1e2321] text-white shadow-xs' : 'text-[#56635a]'
            }`}
          >
            Messages
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'billing' ? 'bg-[#1e2321] text-white shadow-xs' : 'text-[#56635a]'
            }`}
          >
            Billing
          </button>
        </div>
      </div>

      {/* Tab 1: Appointments */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <h3 className="font-serif-editorial text-lg font-semibold text-[#1e2321]">
            Scheduled Sessions
          </h3>

          {appointments.length === 0 ? (
            <div className="p-10 bg-white border border-[#dedad0] rounded text-center text-xs text-[#717b75]">
              No upcoming appointments on file.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map((appt) => (
                <div
                  key={appt._id || appt.id}
                  className="p-5 bg-white border border-[#e2dfd5] rounded shadow-xs space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-serif-editorial text-base font-semibold text-[#1e2321] block">
                        {appt.type}
                      </span>
                      <span className="text-xs text-[#637068]">
                        {new Date(appt.startTime).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-emerald-100 text-emerald-800">
                      {appt.status}
                    </span>
                  </div>

                  <div className="text-xs text-[#4b574f] space-y-1">
                    <div>Duration: {appt.durationMinutes} Minutes</div>
                    <div>Location: {appt.location === 'online' ? 'Telehealth Video' : 'In-Clinic'}</div>
                  </div>

                  {appt.meetingLink && (
                    <div className="pt-2 border-t border-[#f0ede4]">
                      <a
                        href={appt.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1e2321] text-white rounded text-xs font-medium hover:bg-[#2c3731]"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Telehealth Session</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Intake Form */}
      {activeTab === 'intake' && (
        <div className="bg-white border border-[#e2dfd5] rounded p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#eeebe3] pb-4">
            <h3 className="font-serif-editorial text-xl font-semibold text-[#1e2321]">
              Confidential Clinical Intake Questionnaire
            </h3>
            <p className="text-xs text-[#627068] mt-1">
              Please complete this screening before your initial evaluation session.
            </p>
          </div>

          {intakeSubmitted || client?.intakeStatus === 'submitted' || client?.intakeStatus === 'reviewed' ? (
            <div className="p-6 bg-[#f4f7f5] border border-[#cde0d5] rounded text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto" />
              <h4 className="font-serif-editorial text-lg font-semibold text-[#1e2321]">
                Intake Form Submitted
              </h4>
              <p className="text-xs text-[#526058] max-w-md mx-auto">
                Thank you. Your responses have been transmitted to your therapist for clinical review prior to consultation.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitIntake} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1e2321] mb-1">
                  1. What primary concerns bring you to therapy at this time? *
                </label>
                <textarea
                  required
                  rows={3}
                  value={intakeConcerns}
                  onChange={(e) => setIntakeConcerns(e.target.value)}
                  className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#cfcbc0] rounded text-[#1e2321]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1e2321] mb-1">
                  2. Current medical history, conditions, or psychiatric medications:
                </label>
                <textarea
                  rows={2}
                  value={intakeMedical}
                  onChange={(e) => setIntakeMedical(e.target.value)}
                  className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#cfcbc0] rounded text-[#1e2321]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1e2321] mb-1">
                  3. Previous experience with counseling or psychotherapy:
                </label>
                <textarea
                  rows={2}
                  value={intakePriorTherapy}
                  onChange={(e) => setIntakePriorTherapy(e.target.value)}
                  className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#cfcbc0] rounded text-[#1e2321]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1e2321] mb-1">
                  4. What would you like to achieve in our therapeutic work together? *
                </label>
                <textarea
                  required
                  rows={2}
                  value={intakeGoals}
                  onChange={(e) => setIntakeGoals(e.target.value)}
                  className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#cfcbc0] rounded text-[#1e2321]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#f0ede4]">
                <div>
                  <label className="block font-semibold text-[#1e2321] mb-1">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#fcfbf9] border border-[#cfcbc0] rounded text-[#1e2321]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1e2321] mb-1">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#fcfbf9] border border-[#cfcbc0] rounded text-[#1e2321]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#eeebe3] flex items-center justify-between">
                <span className="text-[11px] text-[#69756f]">
                  Transmitted under strict end-to-end data encryption.
                </span>
                <button
                  type="submit"
                  disabled={submittingIntake}
                  className="px-5 py-2.5 bg-[#1e2321] text-white text-xs font-semibold rounded hover:bg-[#2b3530] shadow-xs"
                >
                  {submittingIntake ? 'Submitting...' : 'Submit Digital Intake Form'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tab 3: Messages */}
      {activeTab === 'messages' && (
        <div className="max-w-3xl">
          <ChatWindow
            conversationId={conversationId}
            counterpartName="Dr. Clara Vance, Psy.D."
            counterpartRole="therapist"
            therapistId={therapistId}
            clientId={client?._id || client?.id || 'client_demo'}
          />
        </div>
      )}

      {/* Tab 4: Billing */}
      {activeTab === 'billing' && (
        <div className="bg-white border border-[#e2dfd5] rounded p-6 shadow-xs space-y-4">
          <h3 className="font-serif-editorial text-lg font-semibold text-[#1e2321]">
            Your Invoices & Payment Receipts
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#e7e5dc] text-[#647169] bg-[#f8f7f2]">
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ede4]">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-[#717b75]">
                      No billing records available.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv._id || inv.id}>
                      <td className="py-3 px-3 font-mono font-medium text-[#1e2321]">{inv.invoiceNumber}</td>
                      <td className="py-3 px-3 text-[#536058]">{inv.issueDate}</td>
                      <td className="py-3 px-3 font-mono font-bold text-[#1e2321]">${inv.amount} {inv.currency}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-emerald-100 text-emerald-800">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => window.print()}
                          className="inline-flex items-center gap-1 text-[11px] text-[#4d5b53] hover:text-[#1e2321]"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Print</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
