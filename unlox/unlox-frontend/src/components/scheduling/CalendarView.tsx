import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Video, MapPin, CheckCircle, Clock } from 'lucide-react';

interface CalendarViewProps {
  appointments: any[];
  onSelectAppointment: (appointment: any) => void;
  onOpenBookModal: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  appointments,
  onSelectAppointment,
  onOpenBookModal,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

  // Compute start of week (Monday)
  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const startOfWeek = getMonday(currentDate);

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  const nextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + (viewMode === 'week' ? 7 : 1));
    setCurrentDate(next);
  };

  const prevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(currentDate.getDate() - (viewMode === 'week' ? 7 : 1));
    setCurrentDate(prev);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-[#fdfdfc] border border-[#e2dfd5] rounded shadow-xs overflow-hidden">
      {/* Calendar Header Controls */}
      <div className="p-4 border-b border-[#e7e5dc] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#faf9f6]">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-[#d6d2c6] rounded">
            <button
              onClick={prevWeek}
              className="p-1.5 hover:bg-[#f0ece2] text-[#4f5b53] transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-2.5 py-1 text-xs font-medium text-[#2d3831] border-x border-[#d6d2c6] hover:bg-[#f0ece2]"
            >
              Today
            </button>
            <button
              onClick={nextWeek}
              className="p-1.5 hover:bg-[#f0ece2] text-[#4f5b53] transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h3 className="font-serif-editorial text-base sm:text-lg font-semibold text-[#1e2321]">
            {startOfWeek.toLocaleDateString([], { month: 'long', year: 'numeric' })}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#f0ede4] p-0.5 rounded border border-[#d8d4c8] text-xs">
            <button
              onClick={() => setViewMode('week')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                viewMode === 'week' ? 'bg-[#1e2321] text-white' : 'text-[#56625b]'
              }`}
            >
              Week View
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                viewMode === 'day' ? 'bg-[#1e2321] text-white' : 'text-[#56625b]'
              }`}
            >
              Day View
            </button>
          </div>

          <button
            onClick={onOpenBookModal}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#1e2321] hover:bg-[#2e3732] rounded shadow-xs"
          >
            + Schedule Session
          </button>
        </div>
      </div>

      {/* Week Grid */}
      {viewMode === 'week' ? (
        <div className="grid grid-cols-7 border-b border-[#e7e5dc] divide-x divide-[#eeebe3] text-xs">
          {weekDays.map((day, idx) => {
            const dateStr = day.toISOString().split('T')[0];
            const isToday = dateStr === today;
            const dayAppointments = appointments.filter((a) => a.startTime?.startsWith(dateStr));

            return (
              <div key={idx} className={`min-h-[380px] flex flex-col ${isToday ? 'bg-[#fcfbf7]' : 'bg-white'}`}>
                {/* Day Header */}
                <div className={`p-2.5 text-center border-b border-[#eeebe3] ${isToday ? 'bg-[#f4f2ea]' : 'bg-[#faf9f6]'}`}>
                  <span className="text-[10px] uppercase font-semibold text-[#76807a] block">
                    {day.toLocaleDateString([], { weekday: 'short' })}
                  </span>
                  <span
                    className={`font-serif text-sm font-bold inline-block mt-0.5 ${
                      isToday ? 'text-[#1e2321] underline underline-offset-4 decoration-[#38483e]' : 'text-[#39453e]'
                    }`}
                  >
                    {day.getDate()}
                  </span>
                </div>

                {/* Day Appointment Slots */}
                <div className="p-2 space-y-2 flex-1">
                  {dayAppointments.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[10px] text-[#9fa8a2] italic">
                      No sessions
                    </div>
                  ) : (
                    dayAppointments.map((appt) => (
                      <div
                        key={appt._id || appt.id}
                        onClick={() => onSelectAppointment(appt)}
                        className={`p-2 rounded border text-left cursor-pointer transition-transform hover:-translate-y-0.5 shadow-2xs ${
                          appt.status === 'confirmed'
                            ? 'bg-[#f2f7f4] border-[#c0d8c9] text-[#1c3525]'
                            : appt.status === 'completed'
                            ? 'bg-[#f5f4ef] border-[#dedad0] text-[#55615a]'
                            : 'bg-white border-[#d8d4c8] text-[#1e2321]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#5b6760] mb-0.5">
                          <span>
                            {new Date(appt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="uppercase text-[9px] font-semibold">{appt.status}</span>
                        </div>
                        <div className="font-semibold text-xs truncate">
                          {appt.clientName}
                        </div>
                        <div className="text-[10px] text-[#57635c] truncate">
                          {appt.type}
                        </div>
                        {appt.meetingLink && (
                          <div className="mt-1.5 flex items-center gap-1 text-[9px] text-emerald-800 font-medium">
                            <Video className="w-2.5 h-2.5" />
                            <span>Telehealth Room</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Day View */
        <div className="p-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <h4 className="font-serif-editorial text-lg font-semibold text-[#1e2321]">
              Sessions for {currentDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h4>
            {appointments.filter(a => a.startTime?.startsWith(currentDate.toISOString().split('T')[0])).length === 0 ? (
              <div className="p-8 border border-dashed border-[#dedad0] rounded text-center text-xs text-[#78837d]">
                No appointments scheduled on this date.
              </div>
            ) : (
              appointments
                .filter(a => a.startTime?.startsWith(currentDate.toISOString().split('T')[0]))
                .map(appt => (
                  <div
                    key={appt._id || appt.id}
                    onClick={() => onSelectAppointment(appt)}
                    className="p-4 bg-white border border-[#dedad0] rounded flex items-center justify-between cursor-pointer hover:border-[#1e2321] transition-colors"
                  >
                    <div>
                      <span className="font-serif-editorial text-base font-semibold text-[#1e2321] block">
                        {appt.clientName}
                      </span>
                      <span className="text-xs text-[#5f6c64]">
                        {new Date(appt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(appt.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {appt.type}
                      </span>
                      {appt.notes && <p className="text-xs text-[#414d45] mt-1">{appt.notes}</p>}
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-100 text-emerald-800 block mb-1">
                        {appt.paymentStatus}
                      </span>
                      <span className="font-mono text-xs font-semibold text-[#1e2321]">
                        ${appt.fee}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
