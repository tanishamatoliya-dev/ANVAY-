import { razorpayInstance, isRazorpayLiveConfigured, verifyRazorpaySignature, getRazorpayKeyId } from '../config/razorpay.js';
import { db } from '../store/dbStore.js';
import { notificationService } from './notificationService.js';

export interface CreateOrderParams {
  therapistId: string;
  clientId: string;
  appointmentId?: string;
  amount: number; // in dollars (e.g. 150)
  currency?: string;
  description: string;
}

export class RazorpayService {
  async createPaymentOrder(params: CreateOrderParams) {
    const { therapistId, clientId, appointmentId, amount, currency = 'USD', description } = params;
    const amountInSubunits = Math.round(amount * 100);
    const receipt = `rcpt_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    let orderId: string;

    if (isRazorpayLiveConfigured && razorpayInstance) {
      try {
        const order = await razorpayInstance.orders.create({
          amount: amountInSubunits,
          currency,
          receipt,
          notes: {
            therapistId,
            clientId,
            appointmentId: appointmentId || '',
          },
        });
        orderId = order.id;
      } catch (err: any) {
        console.error('[Razorpay Order Creation Error]', err);
        throw new Error(`Razorpay gateway error: ${err.message}`);
      }
    } else {
      // Test simulation order ID
      orderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }

    // Record pending payment in database
    const payment = await db.payments.create({
      therapistId,
      clientId,
      appointmentId,
      razorpayOrderId: orderId,
      amount,
      currency,
      status: 'pending',
      description,
    });

    return {
      orderId,
      amount,
      amountInSubunits,
      currency,
      keyId: getRazorpayKeyId(),
      paymentId: payment._id || payment.id,
      isLiveConfigured: isRazorpayLiveConfigured,
    };
  }

  async verifyAndCapturePayment(params: {
    orderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const { orderId, razorpayPaymentId, razorpaySignature } = params;

    const isValid = verifyRazorpaySignature(orderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      throw new Error('Invalid Razorpay signature. Payment verification failed.');
    }

    // Find payment record
    const payment = await db.payments.findOne({ razorpayOrderId: orderId });
    if (!payment) {
      throw new Error('Payment record not found for the given order ID.');
    }

    // Update payment record to captured
    const updatedPayment = await db.payments.update(payment._id || payment.id, {
      razorpayPaymentId,
      razorpaySignature,
      status: 'captured',
      receiptUrl: `https://dashboard.razorpay.com/app/payments/${razorpayPaymentId}`,
    });

    // If linked to an appointment, mark appointment as paid
    if (payment.appointmentId) {
      await db.appointments.update(payment.appointmentId, {
        paymentStatus: 'paid',
      });
    }

    // Generate formal invoice
    const client = await db.clients.findById(payment.clientId);
    const invoiceNum = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];

    const invoice = await db.invoices.create({
      therapistId: payment.therapistId,
      clientId: payment.clientId,
      clientName: client?.name || 'Client',
      paymentId: updatedPayment._id || updatedPayment.id,
      invoiceNumber: invoiceNum,
      issueDate: today,
      dueDate: today,
      amount: payment.amount,
      currency: payment.currency,
      status: 'paid',
      items: [
        {
          description: payment.description || 'Clinical Psychotherapy Session',
          quantity: 1,
          unitPrice: payment.amount,
          amount: payment.amount,
        },
      ],
      notes: 'Payment verified and settled securely via Razorpay.',
    });

    // Notify therapist
    const therapist = await db.therapists.findById(payment.therapistId);
    if (therapist) {
      await notificationService.send({
        userId: therapist.userId,
        therapistId: payment.therapistId,
        type: 'payment_completed',
        title: 'Payment Received',
        message: `Received ${payment.currency} $${payment.amount} from ${client?.name || 'Client'} for ${payment.description}.`,
        link: '/payments',
      });
    }

    return {
      success: true,
      payment: updatedPayment,
      invoice,
    };
  }
}

export const razorpayService = new RazorpayService();
