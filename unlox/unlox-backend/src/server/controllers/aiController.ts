import { Response } from 'express';
import { db } from '../store/dbStore.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { aiService } from '../services/aiService.js';
import { entitlementService } from '../services/entitlementService.js';

export async function summarizeIntake(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'therapist') {
      return res.status(403).json({ error: 'Forbidden', message: 'Therapist clinical access required.' });
    }

    const therapist = await db.therapists.findOne({ userId: req.user.id });
    if (!therapist) return res.status(404).json({ error: 'NotFound', message: 'Therapist not found.' });

    // Entitlement verification
    const allowed = await entitlementService.canUseAIAssistant(therapist._id || therapist.id);
    if (!allowed) {
      return res.status(403).json({
        error: 'FeatureNotAvailable',
        message: 'AI Clinical Summaries require the Professional or Practice plan. Upgrade to unlock this workflow.',
      });
    }

    const { clientName, responses } = req.body;
    if (!clientName || !responses) {
      return res.status(400).json({ error: 'ValidationError', message: 'Client name and responses required.' });
    }

    const result = await aiService.summarizeIntakeForm(clientName, responses);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'AISummaryError', message: err.message });
  }
}

export async function formatSOAP(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'therapist') {
      return res.status(403).json({ error: 'Forbidden', message: 'Therapist clinical access required.' });
    }

    const therapist = await db.therapists.findOne({ userId: req.user.id });
    if (!therapist) return res.status(404).json({ error: 'NotFound', message: 'Therapist not found.' });

    const allowed = await entitlementService.canUseAIAssistant(therapist._id || therapist.id);
    if (!allowed) {
      return res.status(403).json({
        error: 'FeatureNotAvailable',
        message: 'AI SOAP Note Assistant requires the Professional or Practice plan. Upgrade to unlock this workflow.',
      });
    }

    const { clientName, rawNotes, sessionDate } = req.body;
    if (!rawNotes || !clientName) {
      return res.status(400).json({ error: 'ValidationError', message: 'Client name and raw notes are required.' });
    }

    const result = await aiService.formatSOAPNote(
      clientName,
      rawNotes,
      sessionDate || new Date().toISOString().split('T')[0]
    );

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'AISOAPError', message: err.message });
  }
}

export async function draftMessage(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'therapist') {
      return res.status(403).json({ error: 'Forbidden', message: 'Therapist clinical access required.' });
    }

    const therapist = await db.therapists.findOne({ userId: req.user.id });
    if (!therapist) return res.status(404).json({ error: 'NotFound', message: 'Therapist not found.' });

    const allowed = await entitlementService.canUseAIAssistant(therapist._id || therapist.id);
    if (!allowed) {
      return res.status(403).json({
        error: 'FeatureNotAvailable',
        message: 'AI Client Communication Assistant requires the Professional or Practice plan.',
      });
    }

    const { clientName, topic, keyPoints } = req.body;
    if (!clientName || !topic) {
      return res.status(400).json({ error: 'ValidationError', message: 'Client name and topic are required.' });
    }

    const result = await aiService.draftClientMessage(
      therapist.professionalName || 'Therapist',
      clientName,
      topic,
      keyPoints || ''
    );

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'AIMessageDraftError', message: err.message });
  }
}
