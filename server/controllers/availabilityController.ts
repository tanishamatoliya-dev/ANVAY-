import { Response } from 'express';
import { db } from '../store/dbStore.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getAvailability(req: AuthenticatedRequest, res: Response) {
  try {
    let therapistId = req.query.therapistId as string;

    if (!therapistId && req.user && req.user.role === 'therapist') {
      const therapist = await db.therapists.findOne({ userId: req.user.id });
      if (therapist) {
        therapistId = therapist._id || therapist.id;
      }
    }

    if (!therapistId) {
      return res.status(400).json({ error: 'ValidationError', message: 'Therapist ID required.' });
    }

    let availability = await db.availability.findOne({ therapistId });
    if (!availability) {
      // Create sensible default schedule
      availability = await db.availability.create({
        therapistId,
        timeZone: 'America/New_York',
        slotDurationMinutes: 50,
        bufferMinutes: 15,
        minNoticeHours: 12,
        maxAdvanceDays: 60,
        weeklySchedule: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', enabled: true },
          { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', enabled: true },
          { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', enabled: true },
          { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', enabled: true },
          { dayOfWeek: 5, startTime: '10:00', endTime: '15:00', enabled: true },
          { dayOfWeek: 6, startTime: '10:00', endTime: '14:00', enabled: false },
          { dayOfWeek: 0, startTime: '10:00', endTime: '14:00', enabled: false },
        ],
        blackoutDates: [],
      });
    }

    res.json(availability);
  } catch (err: any) {
    res.status(500).json({ error: 'AvailabilityError', message: err.message });
  }
}

export async function updateAvailability(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'therapist') {
      return res.status(403).json({ error: 'Forbidden', message: 'Therapist access required.' });
    }

    const therapist = await db.therapists.findOne({ userId: req.user.id });
    if (!therapist) {
      return res.status(404).json({ error: 'NotFound', message: 'Therapist not found.' });
    }

    const therapistId = therapist._id || therapist.id;
    const { weeklySchedule, slotDurationMinutes, bufferMinutes, minNoticeHours, maxAdvanceDays, blackoutDates, timeZone } = req.body;

    const updated = await db.availability.update(therapistId, {
      weeklySchedule,
      slotDurationMinutes: slotDurationMinutes || 50,
      bufferMinutes: bufferMinutes !== undefined ? bufferMinutes : 15,
      minNoticeHours: minNoticeHours || 12,
      maxAdvanceDays: maxAdvanceDays || 60,
      blackoutDates: blackoutDates || [],
      timeZone: timeZone || therapist.timezone || 'America/New_York',
    });

    // Also sync bufferMinutes to therapist profile
    if (bufferMinutes !== undefined) {
      await db.therapists.update(therapistId, { bufferMinutes });
    }

    res.json({ success: true, availability: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'UpdateAvailabilityError', message: err.message });
  }
}
