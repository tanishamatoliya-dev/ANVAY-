import React, { useState, useEffect } from 'react';
import { api } from '../../api/axiosInstance';
import { RazorpayCheckoutModal } from '../../components/payments/RazorpayCheckoutModal';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Award,
  ArrowRight,
  User,
} from 'lucide-react';

interface BookingPageProps {
  slug: string;
  onNavigate?: (tab: string) => void;
}

export const BookingPage: React.FC<BookingPageProps> = ({ slug, onNavigate }) => {
  const [therapist, setTherapist] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking Flow State
  const [selectedSessionType, setSelectedSessionType] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Client form
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [meetingLocation, setMeetingLocation] = useState<'online' | 'in_person'>('online');

  // Booking result / payment state
  const [bookedAppointment, setBookedAppointment] = useState<any | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // 1. Fetch public therapist profile by slug
  useEffect(() => {
    const fetchTherapist = async () => {
      try {
        setLoading(true);
        const data: any = await api.get(`/therapists/${slug}`);
        setTherapist(data);
        if (data.sessionTypes && data.sessionTypes.length > 0) {
          setSelectedSessionType(data.sessionTypes[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Therapist profile could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    fetchTherapist();
  }, [slug]);

  // 2. Query available slots when therapist, date, or session type changes
  useEffect(() => {
    if (!therapist || !selectedDate || !selectedSessionType) return;
    const fetchSlots = async () => {
      try {
        setSlotsLoading(true);
        const slots: any = await api.get(
          `/appointments/available-slots?therapistId=${therapist.id}&date=${selectedDate}&duration=${selectedSessionType.durationMinutes}`
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
  }, [therapist, selectedDate, selectedSessionType]);

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      alert('Please select an available appointment time.');
      return;
    }
    if (!clientName.trim() || !clientEmail.trim()) {
      alert('Name and email are required to confirm booking.');
      return;
    }

    try {
      setBookingSubmitting(true);
      const startTimeISO = `${selectedDate}T${selectedSlot}:00`;
      const startDate = new Date(startTimeISO);
      const endDate = new Date(startDate.getTime() + selectedSessionType.durationMinutes * 60 * 1000);

      const appt: any = await api.post('/appointments', {
        therapistId: therapist.id,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        durationMinutes: selectedSessionType.durationMinutes,
        type: selectedSessionType.name,
        fee: selectedSessionType.price,
        location: meetingLocation,
        notes: clientNotes.trim() || undefined,
      });

      setBookedAppointment(appt);
      setShowPaymentModal(true);
    } catch (err: any) {
      alert(err.message || 'Unable to complete appointment booking.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfbf9] flex items-center justify-center p-6 text-xs text-[#6a766f]">
        Loading verified therapist practice profile...
      </div>
    );
  }

  if (error || !therapist) {
    return (
      <div className="min-h-screen bg-[#fbfbf9] flex items-center justify-center p-6">
        <div className="p-8 max-w-md bg-white border border-[#dedad0] rounded text-center space-y-3">
          <h2 className="font-serif-editorial text-2xl font-semibold text-[#1e2321]">
            Therapist Profile Not Found
          </h2>
          <p className="text-xs text-[#637068]">
            The requested booking link is inactive or has been changed.
          </p>
          <button
            onClick={() => onNavigate && onNavigate('landing')}
            className="px-4 py-2 bg-[#1e2321] text-white text-xs rounded"
          >
            Return to UNLOX Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-[#1e2321] antialiased">
      {/* Editorial Profile Header */}
      <header className="border-b border-[#e7e5dc] bg-[#fdfdfc] py-6 px-6 md:px-16">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif-editorial text-lg font-bold text-[#1e2321]">
              UNLOX
            </span>
            <span className="text-[11px] text-[#78857d]">Clinical Practice Directory</span>
          </div>

          <button
            onClick={() => onNavigate && onNavigate('dashboard')}
            className="text-xs font-medium text-[#46534b] hover:text-[#1e2321]"
          >
            Therapist Portal Login →
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Editorial Therapist Bio (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-[#e4dfd3] border border-[#d6d0c2] shadow-xs">
                {therapist.profileImage ? (
                  <img
                    src={therapist.profileImage}
                    alt={therapist.professionalName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-serif text-2xl text-[#39473e] font-bold">
                    {therapist.professionalName.charAt(0)}
                  </div>
                )}
              </div>

              <div>
                <h1 className="font-serif-editorial text-3xl sm:text-4xl font-semibold tracking-tight text-[#1e2321] leading-tight">
                  {therapist.professionalName}
                </h1>
                <p className="text-xs sm:text-sm text-[#5d6a62] font-medium mt-1">
                  {therapist.title}
                </p>
              </div>

              <div className="text-xs text-[#4b5850] leading-relaxed whitespace-pre-line border-t border-[#eeebe3] pt-4 font-sans">
                {therapist.bio}
              </div>
            </div>

            {/* Specialties & Modalities */}
            <div className="space-y-2 border-t border-[#eeebe3] pt-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#76837c] block">
                Clinical Focus & Modalities
              </span>
              <div className="flex flex-wrap gap-1.5">
                {therapist.specialties?.map((spec: string, i: number) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded bg-[#f3f0e7] border border-[#ded8cb] text-xs text-[#3b4740]"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Qualifications */}
            {therapist.qualifications && therapist.qualifications.length > 0 && (
              <div className="space-y-2 border-t border-[#eeebe3] pt-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#76837c] block">
                  Education & Credentials
                </span>
                <ul className="space-y-1.5 text-xs text-[#525f57]">
                  {therapist.qualifications.map((q: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <Award className="w-3.5 h-3.5 text-[#55675c] shrink-0 mt-0.5" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-3.5 bg-[#f6f5ef] border border-[#ded9cc] rounded text-[11px] text-[#55625a] space-y-1">
              <span className="font-semibold block text-[#1e2321]">Practice Policies</span>
              <span>24-hour cancellation policy applies. Video telehealth sessions are end-to-end encrypted.</span>
            </div>
          </div>

          {/* Right Column: Interactive Booking Architecture (7 cols) */}
          <div className="lg:col-span-7 bg-[#fdfdfc] border border-[#e2dfd5] rounded p-6 sm:p-8 shadow-xs space-y-8">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#727f77] block mb-1">
                Direct Scheduling
              </span>
              <h2 className="font-serif-editorial text-2xl font-semibold text-[#1e2321]">
                Book a Confidential Consultation
              </h2>
              <p className="text-xs text-[#637068] mt-1">
                Select a modality, choose a verified open appointment slot, and finalize your booking.
              </p>
            </div>

            {bookedAppointment && !showPaymentModal ? (
              <div className="p-6 bg-[#f4f7f5] border border-[#cbe2d3] rounded text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-serif-editorial text-xl font-semibold text-[#1e2321]">
                  Appointment Confirmed
                </h3>
                <p className="text-xs text-[#4b5950] leading-relaxed max-w-md mx-auto">
                  Your appointment for <strong>{bookedAppointment.type}</strong> has been placed on the clinical schedule for <strong>{new Date(bookedAppointment.startTime).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</strong>.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setBookedAppointment(null);
                      setSelectedSlot('');
                    }}
                    className="px-4 py-2 bg-[#1e2321] text-white text-xs rounded shadow-xs"
                  >
                    Schedule Another Session
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookSession} className="space-y-6">
                {/* Step 1: Select Session Type */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#1e2321] uppercase tracking-wider">
                    1. Select Consultation Modality
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {therapist.sessionTypes?.map((st: any) => {
                      const isSelected = selectedSessionType?.id === st.id;
                      return (
                        <div
                          key={st.id}
                          onClick={() => setSelectedSessionType(st)}
                          className={`p-3.5 rounded border text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#1e2321] text-white border-[#1e2321]'
                              : 'bg-white text-[#2a342e] border-[#dedad0] hover:bg-[#faf9f6]'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold">{st.name}</span>
                            <span className="font-mono font-bold">${st.price}</span>
                          </div>
                          <span className={`block text-[11px] ${isSelected ? 'text-[#dedcd5]' : 'text-[#6c7871]'}`}>
                            {st.durationMinutes} Minutes • {st.description || 'Clinical Psychotherapy'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Date & Available Non-Conflicting Slots */}
                <div className="space-y-3 pt-4 border-t border-[#eeebe3]">
                  <label className="block text-xs font-bold text-[#1e2321] uppercase tracking-wider">
                    2. Select Date & Verified Available Slot
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div>
                      <label className="block text-[11px] text-[#637068] mb-1">Date</label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#637068] mb-1">Meeting Format</label>
                      <select
                        value={meetingLocation}
                        onChange={(e: any) => setMeetingLocation(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
                      >
                        <option value="online">Telehealth (Encrypted Video)</option>
                        <option value="in_person">In-Clinic Consultation</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#637068] mb-1.5 flex items-center justify-between">
                      <span>Available Time Slots ({selectedDate})</span>
                      {slotsLoading && <span className="text-[10px] text-[#86928b]">Checking live calendar...</span>}
                    </label>

                    {availableSlots.length === 0 ? (
                      <div className="p-4 bg-[#f8f7f3] border border-[#e2dfd5] rounded text-center text-xs text-[#717c76]">
                        No available slots on this date. Please choose another date.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
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
                </div>

                {/* Step 3: Client Details */}
                <div className="space-y-3 pt-4 border-t border-[#eeebe3]">
                  <label className="block text-xs font-bold text-[#1e2321] uppercase tracking-wider">
                    3. Your Contact Information
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#55625a] mb-1">Full Legal Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Julian Ross"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#55625a] mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="julian@example.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#55625a] mb-1">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#55625a] mb-1">Presenting Concern (Brief)</label>
                      <input
                        type="text"
                        placeholder="e.g. Work-related anxiety"
                        value={clientNotes}
                        onChange={(e) => setClientNotes(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#eeebe3] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[#637068] block">Session Total</span>
                    <span className="font-serif text-xl font-bold text-[#1e2321]">
                      ${selectedSessionType?.price}.00 USD
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={bookingSubmitting || !selectedSlot}
                    className="px-6 py-2.5 bg-[#1e2321] text-white text-xs font-semibold rounded hover:bg-[#2b3530] disabled:opacity-50 shadow-xs transition-colors"
                  >
                    {bookingSubmitting ? 'Confirming...' : 'Book & Proceed to Payment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Razorpay Modal */}
      {bookedAppointment && (
        <RazorpayCheckoutModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          therapistId={therapist.id}
          appointmentId={bookedAppointment._id || bookedAppointment.id}
          amount={bookedAppointment.fee}
          description={bookedAppointment.type}
          onPaymentSuccess={() => {
            setShowPaymentModal(false);
          }}
        />
      )}
    </div>
  );
};
