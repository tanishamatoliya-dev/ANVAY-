import { Request, Response } from 'express';
import { db } from '../store/dbStore.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { razorpayService } from '../services/razorpayService.js';
import { isRazorpayLiveConfigured, getRazorpayKeyId } from '../config/razorpay.js';

export async function createOrder(req: Request, res: Response) {
  try {
    const { therapistId, clientId, appointmentId, amount, currency = 'USD', description, paymentMethod = 'direct_invoice' } = req.body;

    if (!therapistId || !amount) {
      return res.status(400).json({ error: 'ValidationError', message: 'Therapist ID and amount are required.' });
    }

    // Direct practice billing without external gateway requirements
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

export async function recordDirectPayment(req: Request, res: Response) {
  try {
    const { therapistId, clientId, appointmentId, amount, currency = 'USD', description, paymentMethod = 'Direct Practice Settlement' } = req.body;

    if (!therapistId || !amount) {
      return res.status(400).json({ error: 'ValidationError', message: 'Therapist ID and amount are required.' });
    }

    const numAmount = Number(amount);
    const paymentId = `pmt_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    const invoiceNum = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];

    // 1. Create captured payment
    const payment = await db.payments.create({
      therapistId,
      clientId: clientId || 'direct_booking',
      appointmentId,
      razorpayOrderId: `ord_direct_${Date.now()}`,
      razorpayPaymentId: paymentId,
      amount: numAmount,
      currency,
      status: 'captured',
      description: description || 'Clinical Psychotherapy Consultation',
    });

    // 2. Mark appointment as paid if linked
    if (appointmentId) {
      await db.appointments.update(appointmentId, { paymentStatus: 'paid' });
    }

    // 3. Create settled invoice
    const client = clientId ? await db.clients.findById(clientId) : null;
    const invoice = await db.invoices.create({
      therapistId,
      clientId: clientId || 'direct_booking',
      clientName: client?.name || 'Client',
      paymentId: payment._id || payment.id,
      invoiceNumber: invoiceNum,
      issueDate: today,
      dueDate: today,
      amount: numAmount,
      currency,
      status: 'paid',
      items: [
        {
          description: description || 'Clinical Psychotherapy Session',
          quantity: 1,
          unitPrice: numAmount,
          amount: numAmount,
        },
      ],
      notes: `Settled via ${paymentMethod}.`,
    });

    res.status(201).json({
      success: true,
      payment,
      invoice,
      message: 'Payment recorded and invoice issued successfully.',
    });
  } catch (err: any) {
    res.status(500).json({ error: 'RecordPaymentError', message: err.message });
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
