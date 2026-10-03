import { Response } from 'express';
import { db } from '../store/dbStore.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function listNotes(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'therapist') {
      return res.status(403).json({ error: 'Forbidden', message: 'Therapist clinical credentials required to view session notes.' });
    }

    const therapist = await db.therapists.findOne({ userId: req.user.id });
    if (!therapist) return res.status(404).json({ error: 'NotFound', message: 'Therapist not found.' });

    const therapistId = therapist._id || therapist.id;
    const { clientId, appointmentId, search } = req.query;

    let notes = await db.notes.find({ therapistId });

    if (clientId && typeof clientId === 'string') {
      notes = notes.filter((n: any) => n.clientId === clientId);
    }
    if (appointmentId && typeof appointmentId === 'string') {
      notes = notes.filter((n: any) => n.appointmentId === appointmentId);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      notes = notes.filter((n: any) =>
        n.title.toLowerCase().includes(q) ||
        (n.subjective && n.subjective.toLowerCase().includes(q)) ||
        (n.assessment && n.assessment.toLowerCase().includes(q)) ||
        (n.generalNotes && n.generalNotes.toLowerCase().includes(q))
      );
    }

    res.json(notes);
  } catch (err: any) {
    res.status(500).json({ error: 'NotesError', message: err.message });
  }
}

export async function createNote(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'therapist') {
      return res.status(403).json({ error: 'Forbidden', message: 'Therapist access required.' });
    }

    const therapist = await db.therapists.findOne({ userId: req.user.id });
    if (!therapist) return res.status(404).json({ error: 'NotFound', message: 'Therapist not found.' });

    const {
      clientId,
      appointmentId,
      sessionDate = new Date().toISOString().split('T')[0],
      title,
      subjective,
      objective,
      assessment,
      plan,
      generalNotes,
      aiAssisted = false,
      isLocked = false,
    } = req.body;

    if (!clientId || !title) {
      return res.status(400).json({ error: 'ValidationError', message: 'Client ID and Note Title are required.' });
    }

    const note = await db.notes.create({
      therapistId: therapist._id || therapist.id,
      clientId,
      appointmentId,
      sessionDate,
      title,
      subjective,
      objective,
      assessment,
      plan,
      generalNotes,
      aiAssisted,
      isLocked,
    });

    res.status(201).json(note);
  } catch (err: any) {
    res.status(500).json({ error: 'CreateNoteError', message: err.message });
  }
}

export async function updateNote(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'therapist') {
      return res.status(403).json({ error: 'Forbidden', message: 'Therapist access required.' });
    }

    const { id } = req.params;
    const note = await db.notes.findById(id);
    if (!note) {
      return res.status(404).json({ error: 'NotFound', message: 'Note not found.' });
    }

    if (note.isLocked && !req.body.unlockOverride) {
      return res.status(400).json({ error: 'NoteLocked', message: 'This clinical session note has been locked and cannot be edited without authorization.' });
    }

    const updated = await db.notes.update(id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'UpdateNoteError', message: err.message });
  }
}

export async function deleteNote(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'therapist') {
      return res.status(403).json({ error: 'Forbidden', message: 'Therapist access required.' });
    }

    const { id } = req.params;
    const note = await db.notes.findById(id);
    if (!note) {
      return res.status(404).json({ error: 'NotFound', message: 'Note not found.' });
    }

    if (note.isLocked) {
      return res.status(400).json({ error: 'NoteLocked', message: 'Locked clinical records cannot be deleted.' });
    }

    await db.notes.delete(id);
    res.json({ success: true, message: 'Note deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'DeleteNoteError', message: err.message });
  }
}
