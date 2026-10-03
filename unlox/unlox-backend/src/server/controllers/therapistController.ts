import { Request, Response } from 'express';
import { db } from '../store/dbStore.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { entitlementService } from '../services/entitlementService.js';

export async function getTherapistBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const therapist = await db.therapists.findOne({ slug: slug.toLowerCase() });

    if (!therapist) {
      return res.status(404).json({
        error: 'TherapistNotFound',
        message: 'Therapist public profile not found.',
      });
    }

    const availability = await db.availability.findOne({ therapistId: therapist._id || therapist.id });

    // Safe public output: no private contact/tax/subscription details
    res.json({
      id: therapist._id || therapist.id,
      professionalName: therapist.professionalName,
      title: therapist.title,
      bio: therapist.bio,
      specialties: therapist.specialties,
      languages: therapist.languages,
      qualifications: therapist.qualifications,
      sessionTypes: therapist.sessionTypes || [],
      profileImage: therapist.profileImage,
      slug: therapist.slug,
      timezone: therapist.timezone,
      bufferMinutes: therapist.bufferMinutes,
      availability: availability?.weeklySchedule || [],
    });
  } catch (err: any) {
    res.status(500).json({ error: 'ServerError', message: err.message });
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'therapist') {
      return res.status(403).json({ error: 'Forbidden', message: 'Therapist access required.' });
    }

    const therapist = await db.therapists.findOne({ userId: req.user.id });
    if (!therapist) {
      return res.status(404).json({ error: 'NotFound', message: 'Therapist profile not found.' });
    }

    const {
      professionalName,
      title,
      bio,
      specialties,
      languages,
      qualifications,
      sessionTypes,
      timezone,
      bufferMinutes,
      phone,
      address,
      slug,
    } = req.body;

    const updated = await db.therapists.update(therapist._id || therapist.id, {
      ...(professionalName && { professionalName }),
      ...(title && { title }),
      ...(bio !== undefined && { bio }),
      ...(specialties && { specialties }),
      ...(languages && { languages }),
      ...(qualifications && { qualifications }),
      ...(sessionTypes && { sessionTypes }),
      ...(timezone && { timezone }),
      ...(bufferMinutes !== undefined && { bufferMinutes }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(slug && { slug: slug.toLowerCase().trim() }),
    });

    res.json({ success: true, therapist: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'UpdateProfileError', message: err.message });
  }
}

export async function getEntitlements(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated.' });
    }

    const therapist = await db.therapists.findOne({ userId: req.user.id });
    if (!therapist) {
      return res.status(404).json({ error: 'NotFound', message: 'Therapist profile not found.' });
    }

    const summary = await entitlementService.getEntitlementsSummary(therapist._id || therapist.id);
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: 'EntitlementError', message: err.message });
  }
}

export async function listPublicTherapists(req: Request, res: Response) {
  try {
    const list = await db.therapists.find();
    const safeList = list.map((t: any) => ({
      id: t._id || t.id,
      professionalName: t.professionalName,
      title: t.title,
      bio: t.bio,
      specialties: t.specialties,
      slug: t.slug,
      sessionTypes: t.sessionTypes,
      profileImage: t.profileImage,
    }));
    res.json(safeList);
  } catch (err: any) {
    res.status(500).json({ error: 'ServerError', message: err.message });
  }
}
