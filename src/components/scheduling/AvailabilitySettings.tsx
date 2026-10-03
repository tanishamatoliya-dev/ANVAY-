import React, { useState, useEffect } from 'react';
import { api } from '../../api/axiosInstance';
import { Clock, Check, Save } from 'lucide-react';

export const AvailabilitySettings: React.FC = () => {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [bufferMinutes, setBufferMinutes] = useState(15);
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(50);
  const [timeZone, setTimeZone] = useState('America/New_York');
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const days = [
    { day: 1, name: 'Monday' },
    { day: 2, name: 'Tuesday' },
    { day: 3, name: 'Wednesday' },
    { day: 4, name: 'Thursday' },
    { day: 5, name: 'Friday' },
    { day: 6, name: 'Saturday' },
    { day: 0, name: 'Sunday' },
  ];

  const fetchAvailability = async () => {
    try {
      const data: any = await api.get('/availability');
      if (data) {
        setSchedule(data.weeklySchedule || []);
        setBufferMinutes(data.bufferMinutes !== undefined ? data.bufferMinutes : 15);
        setSlotDurationMinutes(data.slotDurationMinutes || 50);
        setTimeZone(data.timeZone || 'America/New_York');
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const handleToggleDay = (dayOfWeek: number) => {
    setSchedule(
      schedule.map((item) =>
        item.dayOfWeek === dayOfWeek ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const handleTimeChange = (dayOfWeek: number, field: 'startTime' | 'endTime', value: string) => {
    setSchedule(
      schedule.map((item) =>
        item.dayOfWeek === dayOfWeek ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.put('/availability', {
        weeklySchedule: schedule,
        bufferMinutes: Number(bufferMinutes),
        slotDurationMinutes: Number(slotDurationMinutes),
        timeZone,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fdfdfc] border border-[#e2dfd5] rounded p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-[#eeebe3] pb-4">
        <div>
          <h3 className="font-serif-editorial text-lg font-semibold text-[#1e2321]">
            Practice Availability & Scheduling Rules
          </h3>
          <p className="text-xs text-[#636f68] mt-0.5">
            Configure recurring clinical hours, inter-session buffer buffers, and timezone constraints.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1e2321] hover:bg-[#2e3732] rounded shadow-xs transition-colors"
        >
          {savedSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? 'Saving...' : 'Save Availability'}</span>
            </>
          )}
        </button>
      </div>

      {/* Global Scheduling Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#f8f7f3] border border-[#dedad0] rounded text-xs">
        <div>
          <label className="block font-semibold text-[#1e2321] mb-1">
            Inter-Session Buffer (Minutes)
          </label>
          <select
            value={bufferMinutes}
            onChange={(e) => setBufferMinutes(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
          >
            <option value={5}>5 minutes</option>
            <option value={10}>10 minutes</option>
            <option value={15}>15 minutes (Recommended)</option>
            <option value={20}>20 minutes</option>
            <option value={30}>30 minutes</option>
          </select>
          <span className="text-[10px] text-[#717b75] mt-1 block">
            Guaranteed rest/note buffer between back-to-back bookings.
          </span>
        </div>

        <div>
          <label className="block font-semibold text-[#1e2321] mb-1">
            Default Slot Duration
          </label>
          <select
            value={slotDurationMinutes}
            onChange={(e) => setSlotDurationMinutes(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
          >
            <option value={45}>45 minutes</option>
            <option value={50}>50 minutes</option>
            <option value={60}>60 minutes</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-[#1e2321] mb-1">
            Clinical Timezone
          </label>
          <select
            value={timeZone}
            onChange={(e) => setTimeZone(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
          >
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">London (GMT/BST)</option>
            <option value="Asia/Kolkata">India (IST)</option>
          </select>
        </div>
      </div>

      {/* Day by Day Slots */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-[#1e2321] uppercase tracking-wider">
          Weekly Office Hours
        </h4>
        <div className="divide-y divide-[#eeebe3] border border-[#e2dfd5] rounded overflow-hidden bg-white text-xs">
          {days.map(({ day, name }) => {
            const config = schedule.find((s) => s.dayOfWeek === day) || {
              dayOfWeek: day,
              startTime: '09:00',
              endTime: '17:00',
              enabled: false,
            };

            return (
              <div
                key={day}
                className={`p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  config.enabled ? 'bg-white' : 'bg-[#faf9f7]'
                }`}
              >
                <div className="flex items-center gap-3 w-32">
                  <input
                    type="checkbox"
                    id={`day_${day}`}
                    checked={config.enabled}
                    onChange={() => handleToggleDay(day)}
                    className="rounded border-[#c0bbb0] text-[#1e2321] focus:ring-[#1e2321]"
                  />
                  <label
                    htmlFor={`day_${day}`}
                    className={`font-medium cursor-pointer ${
                      config.enabled ? 'text-[#1e2321]' : 'text-[#8a948e]'
                    }`}
                  >
                    {name}
                  </label>
                </div>

                {config.enabled ? (
                  <div className="flex items-center gap-2 text-xs text-[#4f5b53]">
                    <span>From</span>
                    <input
                      type="time"
                      value={config.startTime}
                      onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                      className="px-2 py-1 bg-white border border-[#cfcbc0] rounded font-mono text-xs"
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={config.endTime}
                      onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                      className="px-2 py-1 bg-white border border-[#cfcbc0] rounded font-mono text-xs"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-[#8e9892] italic">
                    Unavailable / Closed
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
