import { Request, Response } from 'express';
import { db } from '../store/dbStore.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { entitlementService } from '../services/entitlementService.js';
import { notificationService } from '../services/notificationService.js';

export async function listAppointments(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated.' });
    }

    let appointments: any[] = [];

    if (req.user.role === 'therapist') {
      const therapist = await db.therapists.findOne({ userId: req.user.id });
      if (!therapist) return res.status(404).json({ error: 'NotFound', message: 'Therapist not found.' });
      appointments = await db.appointments.find({ therapistId: therapist._id || therapist.id });
    } else if (req.user.role === 'client') {
      const client = await db.clients.findOne({ userId: req.user.id });
      if (!client) return res.status(404).json({ error: 'NotFound', message: 'Client record not found.' });
      appointments = await db.appointments.find({ clientId: client._id || client.id });
    }

    const { status, date } = req.query;
    if (status && status !== 'all') {
      appointments = appointments.filter((a: any) => a.status === status);
    }
    if (date && typeof date === 'string') {
      appointments = appointments.filter((a: any) => a.startTime.startsWith(date));
    }

    res.json(appointments);
  } catch (err: any) {
    res.status(500).json({ error: 'AppointmentListError', message: err.message });
  }
}

export async function createAppointment(req: AuthenticatedRequest, res: Response) {
  try {
    const {
      therapistId,
      clientId,
      clientName,
      clientEmail,
      startTime,
      endTime,
      durationMinutes = 50,
      type = 'Individual Psychotherapy',
      location = 'online',
      fee = 160,
      notes,
    } = req.body;

    if (!therapistId || !startTime || !endTime) {
      return res.status(400).json({ error: 'ValidationError', message: 'Therapist, start time, and end time are required.' });
    }

    // Entitlement Check for therapist
    const check = await entitlementService.canCreateAppointment(therapistId);
    if (!check.allowed) {
      return res.status(403).json({
        error: 'PlanLimitReached',
        message: check.reason,
      });
    }

    const therapist = await db.therapists.findById(therapistId);
    if (!therapist) {
      return res.status(404).json({ error: 'NotFound', message: 'Therapist not found.' });
    }

    // CONFLICT DETECTION & DOUBLE BOOKING PREVENTION
    const newStart = new Date(startTime).getTime();
    const newEnd = new Date(endTime).getTime();
    const bufferMs = (therapist.bufferMinutes || 15) * 60 * 1000;

    const existingAppointments = await db.appointments.find({
      therapistId,
      status: { $in: ['scheduled', 'confirmed'] },
    });

    const hasConflict = existingAppointments.some((appt: any) => {
      const apptStart = new Date(appt.startTime).getTime();
      const apptEnd = new Date(appt.endTime).getTime();
      // Overlap with buffer: (StartA < EndB + buffer) and (EndA + buffer > StartB)
      return (newStart < apptEnd + bufferMs) && (newEnd + bufferMs > apptStart);
    });

    if (hasConflict) {
      return res.status(409).json({
        error: 'SlotUnavailable',
        message: 'This time slot is no longer available or conflicts with an existing appointment and required buffer time.',
      });
    }

    let finalClientId = clientId;
    let finalClientName = clientName;
    let finalClientEmail = clientEmail;

    // If client record doesn't exist yet (e.g. from public booking page), create or find client
    if (!finalClientId && finalClientEmail) {
      let existingClient = await db.clients.findOne({
        therapistId,
        email: finalClientEmail.toLowerCase().trim(),
      });
      if (!existingClient) {
        existingClient = await db.clients.create({
          therapistId,
          name: finalClientName || 'New Client',
          email: finalClientEmail.toLowerCase().trim(),
          intakeStatus: 'pending',
          status: 'active',
          tags: ['Web Booking'],
        });
      }
      finalClientId = existingClient._id || existingClient.id;
      finalClientName = existingClient.name;
    }

    const meetingLink = location === 'online'
      ? `https://telehealth.anvay.care/session/${Math.random().toString(36).substring(2, 10)}`
      : undefined;

    const newAppointment = await db.appointments.create({
      therapistId,
      clientId: finalClientId,
      clientName: finalClientName || 'Client',
      clientEmail: finalClientEmail || '',
      startTime,
      endTime,
      durationMinutes,
      type,
      location,
      fee,
      currency: 'USD',
      paymentStatus: 'unpaid',
      meetingLink,
      notes,
      status: 'scheduled',
      timezone: therapist.timezone || 'America/New_York',
    });

    // Send notifications
    await notificationService.send({
      userId: therapist.userId,
      therapistId,
      type: 'appointment_booked',
      title: 'New Session Scheduled',
      message: `${finalClientName || 'A client'} booked ${type} for ${new Date(startTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}.`,
      link: '/schedule',
    });

    res.status(201).json(newAppointment);
  } catch (err: any) {
    res.status(500).json({ error: 'CreateAppointmentError', message: err.message });
  }
}

export async function updateAppointment(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const existing = await db.appointments.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'NotFound', message: 'Appointment not found.' });
    }

    const updated = await db.appointments.update(id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'UpdateAppointmentError', message: err.message });
  }
}

export async function cancelAppointment(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const existing = await db.appointments.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'NotFound', message: 'Appointment not found.' });
    }

    const updated = await db.appointments.update(id, {
      status: 'cancelled',
      cancellationReason: cancellationReason || 'Cancelled by participant.',
    });

    // Notify therapist
    const therapist = await db.therapists.findById(existing.therapistId);
    if (therapist) {
      await notificationService.send({
        userId: therapist.userId,
        therapistId: existing.therapistId,
        type: 'appointment_cancelled',
        title: 'Appointment Cancelled',
        message: `Appointment on ${new Date(existing.startTime).toLocaleDateString()} was cancelled: ${cancellationReason || 'No reason provided'}.`,
        link: '/schedule',
      });
    }

    res.json({ success: true, appointment: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'CancelAppointmentError', message: err.message });
  }
}

export async function getAvailableSlots(req: Request, res: Response) {
  try {
    const { therapistId, date, duration = '50' } = req.query;

    if (!therapistId || !date || typeof date !== 'string') {
      return res.status(400).json({ error: 'ValidationError', message: 'Therapist ID and valid date (YYYY-MM-DD) are required.' });
    }

    const therapist = await db.therapists.findById(therapistId as string);
    if (!therapist) {
      return res.status(404).json({ error: 'NotFound', message: 'Therapist not found.' });
    }

    const availability = await db.availability.findOne({ therapistId });
    if (!availability) {
      return res.json([]);
    }

    const requestedDate = new Date(`${date}T12:00:00Z`);
    const dayOfWeek = requestedDate.getDay(); // 0 = Sun, 1 = Mon ...

    const dayConfig = availability.weeklySchedule?.find((s: any) => s.dayOfWeek === dayOfWeek);
    if (!dayConfig || !dayConfig.enabled) {
      return res.json([]);
    }

    const durationMinutes = parseInt(duration as string, 10) || 50;
    const bufferMinutes = therapist.bufferMinutes || availability.bufferMinutes || 15;

    // Parse start and end times e.g. "09:00" to "17:00"
    const [startHour, startMin] = dayConfig.startTime.split(':').map(Number);
    const [endHour, endMin] = dayConfig.endTime.split(':').map(Number);

    const dayStartMinutes = startHour * 60 + startMin;
    const dayEndMinutes = endHour * 60 + endMin;

    // Existing appointments on this date
    const appointments = await db.appointments.find({
      therapistId,
      status: { $in: ['scheduled', 'confirmed'] },
    });

    const activeApptsOnDay = appointments.filter((a: any) => a.startTime.startsWith(date));

    const availableSlots: string[] = [];
    let currentSlotStart = dayStartMinutes;

    while (currentSlotStart + durationMinutes <= dayEndMinutes) {
      const slotHour = Math.floor(currentSlotStart / 60);
      const slotMinute = currentSlotStart % 60;
      const slotTimeStr = `${String(slotHour).padStart(2, '0')}:${String(slotMinute).padStart(2, '0')}`;
      const slotStartISO = `${date}T${slotTimeStr}:00`;
      const slotStartDate = new Date(slotStartISO).getTime();
      const slotEndDate = slotStartDate + durationMinutes * 60 * 1000;

      // Check conflict
      const isConflict = activeApptsOnDay.some((appt: any) => {
        const apptStart = new Date(appt.startTime).getTime();
        const apptEnd = new Date(appt.endTime).getTime();
        const bufferMs = bufferMinutes * 60 * 1000;
        return (slotStartDate < apptEnd + bufferMs) && (slotEndDate + bufferMs > apptStart);
      });

      if (!isConflict) {
        availableSlots.push(slotTimeStr);
      }

      currentSlotStart += (durationMinutes + bufferMinutes);
    }

    res.json(availableSlots);
  } catch (err: any) {
    res.status(500).json({ error: 'AvailableSlotsError', message: err.message });
  }
}
