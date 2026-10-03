import React, { useState, useEffect } from 'react';
import { api } from '../../api/axiosInstance';
import { CalendarView } from '../../components/scheduling/CalendarView';
import { AvailabilitySettings } from '../../components/scheduling/AvailabilitySettings';
import { BookAppointmentModal } from '../../components/scheduling/BookAppointmentModal';
import { useAuth } from '../../context/AuthContext';
import { Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';

export const SchedulePage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'calendar' | 'availability'>('calendar');
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);

  const fetchAppointments = async () => {
    try {
      const data: any = await api.get('/appointments');
      setAppointments(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e7e5dc] pb-6">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-widest text-[#727f77] block mb-1">
            Clinical Calendar
          </span>
          <h1 className="font-serif-editorial text-3xl font-medium tracking-tight text-[#1e2321]">
            Schedule & Availability
          </h1>
          <p className="text-xs text-[#5e6b63] mt-1">
            Manage upcoming patient consultations and define weekly buffer constraints.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-[#f0ece2] p-0.5 rounded border border-[#d8d3c5] text-xs">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'calendar' ? 'bg-[#1e2321] text-white shadow-xs' : 'text-[#546158]'
            }`}
          >
            Calendar Grid
          </button>
          <button
            onClick={() => setActiveTab('availability')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'availability' ? 'bg-[#1e2321] text-white shadow-xs' : 'text-[#546158]'
            }`}
          >
            Availability Rules
          </button>
        </div>
      </div>

      {activeTab === 'calendar' ? (
        <CalendarView
          appointments={appointments}
          onSelectAppointment={(appt) => setSelectedAppointment(appt)}
          onOpenBookModal={() => setShowBookModal(true)}
        />
      ) : (
        <AvailabilitySettings />
      )}

      {/* Appointment Detail / Cancellation Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[#dedad0] rounded p-6 max-w-md w-full shadow-lg space-y-4 text-xs">
            <div className="flex items-start justify-between border-b border-[#eeebe3] pb-3">
              <div>
                <span className="font-serif-editorial text-lg font-semibold text-[#1e2321] block">
                  {selectedAppointment.clientName}
                </span>
                <span className="text-[#647169] text-xs">{selectedAppointment.type}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-100 text-emerald-800">
                {selectedAppointment.status}
              </span>
            </div>

            <div className="space-y-2 text-[#46534a]">
              <div className="flex justify-between">
                <span>Start Time:</span>
                <span className="font-semibold text-[#1e2321]">
                  {new Date(selectedAppointment.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-semibold text-[#1e2321]">
                  {selectedAppointment.durationMinutes} Minutes
                </span>
              </div>
              <div className="flex justify-between">
                <span>Meeting Mode:</span>
                <span className="font-semibold text-[#1e2321] capitalize">
                  {selectedAppointment.location}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Fee / Billing:</span>
                <span className="font-semibold text-[#1e2321]">
                  ${selectedAppointment.fee} ({selectedAppointment.paymentStatus})
                </span>
              </div>
              {selectedAppointment.meetingLink && (
                <div className="mt-2 p-2 bg-[#f4f7f5] border border-[#cde0d5] rounded">
                  <span className="text-[11px] font-medium text-emerald-900 block mb-1">
                    Telehealth Room URL:
                  </span>
                  <a
                    href={selectedAppointment.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-700 underline break-all"
                  >
                    {selectedAppointment.meetingLink}
                  </a>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#eeebe3] flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-3 py-1.5 border border-[#d6d2c6] text-[#48554d] hover:bg-[#f6f5ef] rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <BookAppointmentModal
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
        onAppointmentBooked={fetchAppointments}
      />
    </div>
  );
};
