import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { Clock, Calendar, Video, MapPin, AlertCircle } from 'lucide-react';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentBooked: () => void;
  preselectedClientId?: string;
  preselectedClientName?: string;
}

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  isOpen,
  onClose,
  onAppointmentBooked,
  preselectedClientId,
  preselectedClientName,
}) => {
  const { therapist } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [clientId, setClientId] = useState(preselectedClientId || '');
  const [clientName, setClientName] = useState(preselectedClientName || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [duration, setDuration] = useState(50);
  const [sessionType, setSessionType] = useState('Individual Psychotherapy');
  const [location, setLocation] = useState<'online' | 'in_person'>('online');
  const [fee, setFee] = useState(180);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.get('/clients').then((res: any) => {
        setClients(res || []);
        if (preselectedClientId) {
          setClientId(preselectedClientId);
        } else if (res && res.length > 0 && !clientId) {
          setClientId(res[0]._id || res[0].id);
          setClientName(res[0].name);
        }
      }).catch(() => {});
    }
  }, [isOpen, preselectedClientId]);

  // Fetch available non-conflicting slots whenever date, therapist, or duration changes
  useEffect(() => {
    if (!isOpen || !therapist || !date) return;
    const fetchSlots = async () => {
      try {
        setSlotsLoading(true);
        const slots: any = await api.get(
          `/appointments/available-slots?therapistId=${therapist.id}&date=${date}&duration=${duration}`
        );
        setAvailableSlots(slots || []);
        if (slots && slots.length > 0) {
          setSelectedSlot(slots[0]);
        } else {
          setSelectedSlot('');
        }
      } catch (e) {
        setAvailableSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [isOpen, therapist, date, duration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Please select an available time slot.');
      return;
    }
    if (!therapist) {
      setError('Therapist context missing.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const startTimeISO = `${date}T${selectedSlot}:00`;
      const startDate = new Date(startTimeISO);
      const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

      const selectedClient = clients.find(c => (c._id || c.id) === clientId);

      await api.post('/appointments', {
        therapistId: therapist.id,
        clientId,
        clientName: selectedClient?.name || clientName || 'Client',
        clientEmail: selectedClient?.email || '',
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        durationMinutes: duration,
        type: sessionType,
        location,
        fee,
        notes: notes.trim() || undefined,
      });

      onAppointmentBooked();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Unable to schedule appointment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Clinical Appointment"
      subtitle="Select a verified available time slot respecting buffer periods."
      maxWidth="max-w-lg"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Client Selection */}
        <div>
          <label className="block text-xs font-semibold text-[#1e2321] mb-1">
            Client *
          </label>
          {preselectedClientName ? (
            <div className="p-2.5 bg-[#f4f2ec] border border-[#dcd8cb] rounded text-xs font-medium text-[#1e2321]">
              {preselectedClientName}
            </div>
          ) : (
            <select
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                const found = clients.find(c => (c._id || c.id) === e.target.value);
                if (found) setClientName(found.name);
              }}
              className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
            >
              {clients.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Session Type & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#1e2321] mb-1">
              Session Modality
            </label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
            >
              <option value="Individual Psychotherapy">Individual Psychotherapy</option>
              <option value="Intake & Clinical Evaluation">Intake & Clinical Evaluation</option>
              <option value="Couples / Relational Session">Couples / Relational Session</option>
              <option value="Brief Follow-up">Brief Follow-up</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1e2321] mb-1">
              Duration (Minutes)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={50}>50 minutes (Standard)</option>
              <option value={60}>60 minutes</option>
              <option value={75}>75 minutes (Intake)</option>
              <option value={90}>90 minutes</option>
            </select>
          </div>
        </div>

        {/* Date and Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#1e2321] mb-1">
              Date *
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1e2321] mb-1">
              Meeting Format
            </label>
            <select
              value={location}
              onChange={(e: any) => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
            >
              <option value="online">Telehealth (Secure Video)</option>
              <option value="in_person">In-Clinic Consultation</option>
            </select>
          </div>
        </div>

        {/* Available Non-conflicting Slots */}
        <div>
          <label className="block text-xs font-semibold text-[#1e2321] mb-1.5 flex items-center justify-between">
            <span>Available Time Slots ({date})</span>
            {slotsLoading && <span className="text-[10px] text-[#717c76]">Checking schedule...</span>}
          </label>

          {availableSlots.length === 0 ? (
            <div className="p-4 bg-[#f8f7f3] border border-[#e2dfd5] rounded text-center text-xs text-[#717c76]">
              No available slots on this date. The therapist may be off or fully booked with buffers.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2 px-3 text-xs font-mono rounded border transition-colors ${
                    selectedSlot === slot
                      ? 'bg-[#1e2321] text-white border-[#1e2321] font-semibold'
                      : 'bg-white text-[#2a342e] border-[#d8d4c8] hover:bg-[#f5f3ec]'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Session Fee */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#1e2321] mb-1">
              Session Fee ($ USD)
            </label>
            <input
              type="number"
              value={fee}
              onChange={(e) => setFee(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1e2321] mb-1">
              Session Focus / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. CBT follow-up"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-[#e7e5dc] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-[#48534d] hover:bg-[#f0ece2] rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !selectedSlot}
            className="px-4 py-2 text-xs font-medium text-white bg-[#1e2321] hover:bg-[#2b3530] disabled:opacity-50 rounded shadow-xs"
          >
            {loading ? 'Booking...' : 'Confirm Appointment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
