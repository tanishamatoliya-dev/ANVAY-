import { Request, Response } from 'express';
import { db } from '../store/dbStore.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { razorpayService } from '../services/razorpayService.js';
import { isRazorpayLiveConfigured, getRazorpayKeyId } from '../config/razorpay.js';

export async function createOrder(req: Request, res: Response) {
  try {
    const { therapistId, clientId, appointmentId, amount, currency = 'USD', description } = req.body;

    if (!therapistId || !amount) {
      return res.status(400).json({ error: 'ValidationError', message: 'Therapist ID and amount are required.' });
    }

    const orderData = await razorpayService.createPaymentOrder({
      therapistId,
      clientId: clientId || 'direct_booking',
      appointmentId,
      amount: Number(amount),
      currency,
      description: description || 'Therapy Session Payment',
    });

    res.json(orderData);
  } catch (err: any) {
    res.status(500).json({ error: 'CreateOrderError', message: err.message });
  }
}

export async function verifyPayment(req: Request, res: Response) {
  try {
    const { orderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Order ID, Payment ID, and Signature are required for verification.',
      });
    }

    const result = await razorpayService.verifyAndCapturePayment({
      orderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: 'PaymentVerificationFailed', message: err.message });
  }
}

export async function listPayments(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated.' });
    }

    let payments = [];

    if (req.user.role === 'therapist') {
      const therapist = await db.therapists.findOne({ userId: req.user.id });
      if (!therapist) return res.status(404).json({ error: 'NotFound', message: 'Therapist not found.' });
      payments = await db.payments.find({ therapistId: therapist._id || therapist.id });
    } else if (req.user.role === 'client') {
      const client = await db.clients.findOne({ userId: req.user.id });
      if (!client) return res.status(404).json({ error: 'NotFound', message: 'Client record not found.' });
      payments = await db.payments.find({ clientId: client._id || client.id });
    }

    res.json({
      payments,
      gatewayConfig: {
        isLiveConfigured: isRazorpayLiveConfigured,
        keyId: getRazorpayKeyId(),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'PaymentListError', message: err.message });
  }
}

export async function listInvoices(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated.' });
    }

    let invoices = [];

    if (req.user.role === 'therapist') {
      const therapist = await db.therapists.findOne({ userId: req.user.id });
      if (!therapist) return res.status(404).json({ error: 'NotFound', message: 'Therapist not found.' });
      invoices = await db.invoices.find({ therapistId: therapist._id || therapist.id });
    } else if (req.user.role === 'client') {
      const client = await db.clients.findOne({ userId: req.user.id });
      if (!client) return res.status(404).json({ error: 'NotFound', message: 'Client not found.' });
      invoices = await db.invoices.find({ clientId: client._id || client.id });
    }

    res.json(invoices);
  } catch (err: any) {
    res.status(500).json({ error: 'InvoiceListError', message: err.message });
  }
}
