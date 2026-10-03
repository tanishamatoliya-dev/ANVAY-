import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import {
  getTherapistBySlug,
  updateProfile,
  getEntitlements,
  listPublicTherapists,
} from '../controllers/therapistController.js';
import {
  listClients,
  getClientById,
  createClient,
  updateClient,
  archiveClient,
  submitIntake,
} from '../controllers/clientController.js';
import {
  listAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getAvailableSlots,
} from '../controllers/appointmentController.js';
import {
  getAvailability,
  updateAvailability,
} from '../controllers/availabilityController.js';
import {
  listNotes,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/noteController.js';
import {
  createOrder,
  verifyPayment,
  recordDirectPayment,
  listPayments,
  listInvoices,
} from '../controllers/paymentController.js';
import {
  getConversations,
  getMessages,
  sendMessage,
} from '../controllers/messageController.js';
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/notificationController.js';
import {
  summarizeIntake,
  formatSOAP,
  draftMessage,
} from '../controllers/aiController.js';
import { getAnalytics } from '../controllers/analyticsController.js';
import { requireAuth, requireTherapist, optionalAuth } from '../middleware/auth.js';
import { dbStatus } from '../config/db.js';

const router = Router();

// System / Health / Database Status
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    product: 'ANVAY',
    database: {
      connected: dbStatus.connected,
      type: dbStatus.type,
      host: dbStatus.host || 'local-memory-store',
      note: dbStatus.connected
        ? 'Connected live to MongoDB Atlas'
        : 'Running on in-memory persistence. Provide MONGO_URI in .env to connect to live MongoDB Atlas cluster.',
    },
    timestamp: new Date().toISOString(),
  });
});

// Authentication
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', requireAuth, getMe);

// Therapists
router.get('/therapists/public', listPublicTherapists);
router.get('/therapists/entitlements', requireAuth, getEntitlements);
router.get('/therapists/:slug', getTherapistBySlug);
router.put('/therapists/profile', requireAuth, requireTherapist, updateProfile);

// Clients
router.get('/clients', requireAuth, listClients);
router.post('/clients', requireAuth, requireTherapist, createClient);
router.get('/clients/:id', requireAuth, getClientById);
router.put('/clients/:id', requireAuth, requireTherapist, updateClient);
router.put('/clients/:id/archive', requireAuth, requireTherapist, archiveClient);
router.post('/clients/intake/submit', submitIntake);

// Appointments & Availability
router.get('/appointments/available-slots', getAvailableSlots);
router.get('/appointments', requireAuth, listAppointments);
router.post('/appointments', optionalAuth, createAppointment);
router.put('/appointments/:id', requireAuth, updateAppointment);
router.delete('/appointments/:id', requireAuth, cancelAppointment);

router.get('/availability', optionalAuth, getAvailability);
router.post('/availability', requireAuth, requireTherapist, updateAvailability);
router.put('/availability', requireAuth, requireTherapist, updateAvailability);

// Clinical Session Notes (Therapist Only)
router.get('/notes', requireAuth, requireTherapist, listNotes);
router.post('/notes', requireAuth, requireTherapist, createNote);
router.put('/notes/:id', requireAuth, requireTherapist, updateNote);
router.delete('/notes/:id', requireAuth, requireTherapist, deleteNote);

// Payments & Invoices (Direct Practice Billing)
router.post('/payments/create-order', createOrder);
router.post('/payments/verify', verifyPayment);
router.post('/payments/record-direct', recordDirectPayment);
router.get('/payments', requireAuth, listPayments);
router.get('/invoices', requireAuth, listInvoices);

// Real-time Chat & Messages
router.get('/messages/conversations', requireAuth, getConversations);
router.get('/messages/:conversationId', requireAuth, getMessages);
router.post('/messages', requireAuth, sendMessage);

// Notifications
router.get('/notifications', requireAuth, listNotifications);
router.put('/notifications/:id/read', requireAuth, markNotificationRead);
router.put('/notifications/read-all', requireAuth, markAllNotificationsRead);

// AI Assisted Clinical Tools
router.post('/ai/summarize-intake', requireAuth, requireTherapist, summarizeIntake);
router.post('/ai/format-soap', requireAuth, requireTherapist, formatSOAP);
router.post('/ai/draft-message', requireAuth, requireTherapist, draftMessage);

// Practice Analytics
router.get('/analytics', requireAuth, requireTherapist, getAnalytics);

export default router;
