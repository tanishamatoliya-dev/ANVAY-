import { Request, Response } from 'express';
import { db } from '../store/dbStore.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { entitlementService } from '../services/entitlementService.js';
import { aiService } from '../services/aiService.js';
import { notificationService } from '../services/notificationService.js';

export async function listClients(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'therapist') {
      return res.status(403).json({ error: 'Forbidden', message: 'Therapist access required.' });
    }

    const therapist = await db.therapists.findOne({ userId: req.user.id });
    if (!therapist) {
      return res.status(404).json({ error: 'NotFound', message: 'Therapist profile not found.' });
    }

    const therapistId = therapist._id || therapist.id;
    const { status = 'active', search, intakeStatus } = req.query;

    let clients = await db.clients.find({ therapistId });

    if (status && status !== 'all') {
      clients = clients.filter((c: any) => c.status === status);
    }

    if (intakeStatus && intakeStatus !== 'all') {
      clients = clients.filter((c: any) => c.intakeStatus === intakeStatus);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      clients = clients.filter((c: any) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.tags && c.tags.some((t: string) => t.toLowerCase().includes(q)))
      );
    }

    res.json(clients);
  } catch (err: any) {
    res.status(500).json({ error: 'ClientListError', message: err.message });
  }
}

export async function getClientById(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated.' });
    }

    const { id } = req.params;
    const client = await db.clients.findById(id);

    if (!client) {
      return res.status(404).json({ error: 'NotFound', message: 'Client not found.' });
    }

    // Security check: client can only see their own profile, therapist can only see their clients
    if (req.user.role === 'client') {
      if (client.userId !== req.user.id && client._id !== req.user.clientId) {
        return res.status(403).json({ error: 'Forbidden', message: 'Access denied to this client record.' });
      }
    } else if (req.user.role === 'therapist') {
      const therapist = await db.therapists.findOne({ userId: req.user.id });
      if (!therapist || client.therapistId !== (therapist._id || therapist.id)) {
        return res.status(403).json({ error: 'Forbidden', message: 'Access denied.' });
      }
    }

    // Fetch related records
    const appointments = await db.appointments.find({ clientId: client._id || client.id });
    const invoices = await db.invoices.find({ clientId: client._id || client.id });
    const intakeResponse = await db.intakeResponses.findOne({ clientId: client._id || client.id });

    // Private notes only returned to therapist
    let notes: any[] = [];
    if (req.user.role === 'therapist') {
      notes = await db.notes.find({ clientId: client._id || client.id });
    }

    res.json({
      client,
      appointments,
      invoices,
      intakeResponse,
      notes,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'GetClientError', message: err.message });
  }
}

export async function createClient(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'therapist') {
      return res.status(403).json({ error: 'Forbidden', message: 'Therapist access required.' });
    }

    const therapist = await db.therapists.findOne({ userId: req.user.id });
    if (!therapist) {
      return res.status(404).json({ error: 'NotFound', message: 'Therapist profile not found.' });
    }

    const therapistId = therapist._id || therapist.id;

    // Centralized Entitlement Check
    const check = await entitlementService.canCreateClient(therapistId);
    if (!check.allowed) {
      return res.status(403).json({
        error: 'PlanLimitReached',
        message: check.reason,
        currentCount: check.currentCount,
        maxLimit: check.maxLimit,
      });
    }

    const { name, email, phone, dateOfBirth, tags, notes, emergencyContact } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'ValidationError', message: 'Name and email are required.' });
    }

    const newClient = await db.clients.create({
      therapistId,
      name,
      email: email.toLowerCase().trim(),
      phone,
      dateOfBirth,
      tags: tags || ['Individual Therapy'],
      notes,
      intakeStatus: 'pending',
      status: 'active',
      emergencyContact,
    });

    res.status(201).json(newClient);
  } catch (err: any) {
    res.status(500).json({ error: 'CreateClientError', message: err.message });
  }
}

export async function updateClient(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'therapist') {
      return res.status(403).json({ error: 'Forbidden', message: 'Therapist access required.' });
    }

    const { id } = req.params;
    const client = await db.clients.findById(id);
    if (!client) {
      return res.status(404).json({ error: 'NotFound', message: 'Client not found.' });
    }

    const updated = await db.clients.update(id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'UpdateClientError', message: err.message });
  }
}

export async function archiveClient(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'therapist') {
      return res.status(403).json({ error: 'Forbidden', message: 'Therapist access required.' });
    }

    const { id } = req.params;
    const client = await db.clients.findById(id);
    if (!client) {
      return res.status(404).json({ error: 'NotFound', message: 'Client not found.' });
    }

    const nextStatus = client.status === 'archived' ? 'active' : 'archived';
    const updated = await db.clients.update(id, { status: nextStatus });
    res.json({ success: true, client: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'ArchiveClientError', message: err.message });
  }
}

export async function submitIntake(req: Request, res: Response) {
  try {
    const { clientId, responses, formId = 'default_intake' } = req.body;
    if (!clientId || !responses) {
      return res.status(400).json({ error: 'ValidationError', message: 'ClientId and responses required.' });
    }

    const client = await db.clients.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'NotFound', message: 'Client record not found.' });
    }

    // AI Clinical Summary generation (background/assistive)
    let aiSummary = '';
    try {
      const summaryResult = await aiService.summarizeIntakeForm(client.name, responses);
      if (summaryResult.success) {
        aiSummary = summaryResult.content;
      }
    } catch (e) {
      console.warn('AI intake summary error:', e);
    }

    const intakeRecord = await db.intakeResponses.create({
      therapistId: client.therapistId,
      clientId: client._id || client.id,
      formId,
      responses,
      aiClinicalSummary: aiSummary,
      status: 'submitted',
      submittedAt: new Date(),
    });

    await db.clients.update(client._id || client.id, {
      intakeStatus: 'submitted',
      intakeResponseId: intakeRecord._id || intakeRecord.id,
    });

    // Notify therapist
    const therapist = await db.therapists.findById(client.therapistId);
    if (therapist) {
      await notificationService.send({
        userId: therapist.userId,
        therapistId: client.therapistId,
        type: 'intake_submitted',
        title: 'New Client Intake Form',
        message: `${client.name} has submitted their clinical intake questionnaire.`,
        link: `/clients/${client._id || client.id}`,
      });
    }

    res.status(201).json({
      success: true,
      intakeResponse: intakeRecord,
      message: 'Intake form submitted securely.',
    });
  } catch (err: any) {
    res.status(500).json({ error: 'SubmitIntakeError', message: err.message });
  }
}
