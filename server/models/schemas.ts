import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. User
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'therapist' | 'client' | 'admin';
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['therapist', 'client', 'admin'], default: 'therapist' },
  avatarUrl: { type: String },
}, { timestamps: true });

// 2. Therapist
export interface ITherapist extends Document {
  userId: string;
  email?: string;
  professionalName: string;
  title: string;
  bio: string;
  specialties: string[];
  languages: string[];
  qualifications: string[];
  sessionTypes: {
    id: string;
    name: string;
    durationMinutes: number;
    price: number;
    currency: string;
    description: string;
  }[];
  profileImage: string;
  slug: string;
  timezone: string;
  bufferMinutes: number;
  phone?: string;
  address?: string;
  subscriptionPlan: 'starter' | 'professional' | 'practice';
  subscriptionStatus: 'active' | 'trialing' | 'past_due' | 'canceled';
  createdAt: Date;
  updatedAt: Date;
}

const TherapistSchema = new Schema<ITherapist>({
  userId: { type: String, required: true, index: true },
  email: { type: String, lowercase: true, trim: true },
  professionalName: { type: String, required: true },
  title: { type: String, default: 'Licensed Clinical Psychologist' },
  bio: { type: String, default: '' },
  specialties: [{ type: String }],
  languages: [{ type: String }],
  qualifications: [{ type: String }],
  sessionTypes: [{
    id: String,
    name: String,
    durationMinutes: Number,
    price: Number,
    currency: String,
    description: String,
  }],
  profileImage: { type: String, default: '' },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  timezone: { type: String, default: 'America/New_York' },
  bufferMinutes: { type: Number, default: 15 },
  phone: String,
  address: String,
  subscriptionPlan: { type: String, enum: ['starter', 'professional', 'practice'], default: 'professional' },
  subscriptionStatus: { type: String, default: 'active' },
}, { timestamps: true });

// 3. Client
export interface IClient extends Document {
  therapistId: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  intakeStatus: 'pending' | 'submitted' | 'reviewed';
  intakeFormId?: string;
  intakeResponseId?: string;
  tags: string[];
  notes?: string;
  status: 'active' | 'archived';
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>({
  therapistId: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: String,
  dateOfBirth: String,
  intakeStatus: { type: String, enum: ['pending', 'submitted', 'reviewed'], default: 'pending' },
  intakeFormId: String,
  intakeResponseId: String,
  tags: [{ type: String }],
  notes: String,
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
  },
}, { timestamps: true });

// 4. Appointment
export interface IAppointment extends Document {
  therapistId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  startTime: string; // ISO
  endTime: string;   // ISO
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  type: string;      // e.g. "Individual Psychotherapy"
  durationMinutes: number;
  meetingLink?: string;
  location: 'online' | 'in_person';
  fee: number;
  currency: string;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  notes?: string;
  timezone: string;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>({
  therapistId: { type: String, required: true, index: true },
  clientId: { type: String, required: true, index: true },
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: { type: String, enum: ['scheduled', 'confirmed', 'completed', 'cancelled'], default: 'scheduled' },
  type: { type: String, default: 'Standard Therapy Session' },
  durationMinutes: { type: Number, default: 50 },
  meetingLink: String,
  location: { type: String, enum: ['online', 'in_person'], default: 'online' },
  fee: { type: Number, default: 150 },
  currency: { type: String, default: 'USD' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
  notes: String,
  timezone: { type: String, default: 'America/New_York' },
  cancellationReason: String,
}, { timestamps: true });

// 5. Availability
export interface IAvailabilitySlot {
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  enabled: boolean;
}

export interface IAvailability extends Document {
  therapistId: string;
  weeklySchedule: IAvailabilitySlot[];
  timeZone: string;
  slotDurationMinutes: number;
  bufferMinutes: number;
  minNoticeHours: number;
  maxAdvanceDays: number;
  blackoutDates: string[]; // YYYY-MM-DD
}

const AvailabilitySchema = new Schema<IAvailability>({
  therapistId: { type: String, required: true, unique: true },
  weeklySchedule: [{
    dayOfWeek: Number,
    startTime: String,
    endTime: String,
    enabled: Boolean,
  }],
  timeZone: { type: String, default: 'America/New_York' },
  slotDurationMinutes: { type: Number, default: 50 },
  bufferMinutes: { type: Number, default: 15 },
  minNoticeHours: { type: Number, default: 12 },
  maxAdvanceDays: { type: Number, default: 60 },
  blackoutDates: [{ type: String }],
}, { timestamps: true });

// 6. Session Note (Strictly Private to Therapist)
export interface ISessionNote extends Document {
  therapistId: string;
  clientId: string;
  appointmentId?: string;
  sessionDate: string;
  title: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  generalNotes?: string;
  aiAssisted?: boolean;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SessionNoteSchema = new Schema<ISessionNote>({
  therapistId: { type: String, required: true, index: true },
  clientId: { type: String, required: true, index: true },
  appointmentId: { type: String, index: true },
  sessionDate: { type: String, required: true },
  title: { type: String, required: true },
  subjective: String,
  objective: String,
  assessment: String,
  plan: String,
  generalNotes: String,
  aiAssisted: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
}, { timestamps: true });

// 7. Intake Form Definition & Intake Response
export interface IIntakeForm extends Document {
  therapistId: string;
  title: string;
  description: string;
  questions: {
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox';
    options?: string[];
    required: boolean;
  }[];
  isDefault: boolean;
}

const IntakeFormSchema = new Schema<IIntakeForm>({
  therapistId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: String,
  questions: [{
    id: String,
    label: String,
    type: { type: String, enum: ['text', 'textarea', 'select', 'checkbox'] },
    options: [String],
    required: Boolean,
  }],
  isDefault: { type: Boolean, default: true },
}, { timestamps: true });

export interface IIntakeResponse extends Document {
  therapistId: string;
  clientId: string;
  formId: string;
  responses: Record<string, any>;
  aiClinicalSummary?: string;
  status: 'submitted' | 'reviewed';
  submittedAt: Date;
}

const IntakeResponseSchema = new Schema<IIntakeResponse>({
  therapistId: { type: String, required: true, index: true },
  clientId: { type: String, required: true, index: true },
  formId: { type: String, required: true },
  responses: { type: Schema.Types.Mixed, default: {} },
  aiClinicalSummary: String,
  status: { type: String, enum: ['submitted', 'reviewed'], default: 'submitted' },
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// 8. Payment & Invoice
export interface IPayment extends Document {
  therapistId: string;
  clientId: string;
  appointmentId?: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number; // in smallest unit (e.g. cents/paise) or major unit
  currency: string;
  status: 'pending' | 'captured' | 'failed' | 'refunded';
  description: string;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  therapistId: { type: String, required: true, index: true },
  clientId: { type: String, required: true, index: true },
  appointmentId: String,
  razorpayOrderId: { type: String, required: true, index: true },
  razorpayPaymentId: String,
  razorpaySignature: String,
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['pending', 'captured', 'failed', 'refunded'], default: 'pending' },
  description: String,
  receiptUrl: String,
}, { timestamps: true });

export interface IInvoice extends Document {
  therapistId: string;
  clientId: string;
  clientName: string;
  paymentId?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: 'draft' | 'issued' | 'paid' | 'overdue';
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>({
  therapistId: { type: String, required: true, index: true },
  clientId: { type: String, required: true, index: true },
  clientName: { type: String, required: true },
  paymentId: String,
  invoiceNumber: { type: String, required: true, unique: true },
  issueDate: { type: String, required: true },
  dueDate: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['draft', 'issued', 'paid', 'overdue'], default: 'issued' },
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    amount: Number,
  }],
  notes: String,
}, { timestamps: true });

// 9. Subscription
export interface ISubscription extends Document {
  therapistId: string;
  plan: 'starter' | 'professional' | 'practice';
  status: 'active' | 'trialing' | 'canceled' | 'past_due';
  razorpaySubscriptionId?: string;
  startDate: string;
  endDate: string;
  cancelAtPeriodEnd: boolean;
}

const SubscriptionSchema = new Schema<ISubscription>({
  therapistId: { type: String, required: true, unique: true },
  plan: { type: String, enum: ['starter', 'professional', 'practice'], default: 'professional' },
  status: { type: String, default: 'active' },
  razorpaySubscriptionId: String,
  startDate: String,
  endDate: String,
  cancelAtPeriodEnd: { type: Boolean, default: false },
}, { timestamps: true });

// 10. Message (Real-time Chat)
export interface IMessage extends Document {
  conversationId: string;
  therapistId: string;
  clientId: string;
  senderId: string;
  senderRole: 'therapist' | 'client';
  text: string;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  conversationId: { type: String, required: true, index: true },
  therapistId: { type: String, required: true, index: true },
  clientId: { type: String, required: true, index: true },
  senderId: { type: String, required: true },
  senderRole: { type: String, enum: ['therapist', 'client'], required: true },
  text: { type: String, required: true },
  readAt: Date,
}, { timestamps: true });

// 11. Notification
export interface INotification extends Document {
  userId: string;
  therapistId?: string;
  type: 'appointment_booked' | 'appointment_cancelled' | 'payment_completed' | 'intake_submitted' | 'message_received' | 'reminder';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: String, required: true, index: true },
  therapistId: String,
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  link: String,
}, { timestamps: true });

// Model exports
export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const TherapistModel = mongoose.models.Therapist || mongoose.model<ITherapist>('Therapist', TherapistSchema);
export const ClientModel = mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);
export const AppointmentModel = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
export const AvailabilityModel = mongoose.models.Availability || mongoose.model<IAvailability>('Availability', AvailabilitySchema);
export const SessionNoteModel = mongoose.models.SessionNote || mongoose.model<ISessionNote>('SessionNote', SessionNoteSchema);
export const IntakeFormModel = mongoose.models.IntakeForm || mongoose.model<IIntakeForm>('IntakeForm', IntakeFormSchema);
export const IntakeResponseModel = mongoose.models.IntakeResponse || mongoose.model<IIntakeResponse>('IntakeResponse', IntakeResponseSchema);
export const PaymentModel = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
export const InvoiceModel = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
export const SubscriptionModel = mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
export const MessageModel = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
export const NotificationModel = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
