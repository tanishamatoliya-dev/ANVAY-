import { db } from '../store/dbStore.js';
import { hashPassword } from '../middleware/auth.js';

export async function seedDevelopmentData(): Promise<void> {
  const existingUsers = await db.users.find();
  if (existingUsers && existingUsers.length > 0) {
    return; // Already initialized
  }

  console.log('[UNLOX] Seeding initial DEVELOPMENT DEMO DATA for test and development inspection...');

  const passwordHash = await hashPassword('Password123!');

  // 1. Therapist: Dr. Clara Vance
  const therapistUser = await db.users.create({
    name: 'Dr. Clara Vance, Psy.D.',
    email: 'dr.clara@unlox.practice',
    passwordHash,
    role: 'therapist',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  });

  const therapist = await db.therapists.create({
    userId: therapistUser._id || therapistUser.id,
    professionalName: 'Dr. Clara Vance, Psy.D.',
    title: 'Licensed Clinical Psychologist & Relational Psychotherapist',
    bio: 'Providing contemplative, evidence-based psychotherapy for adults navigating high-responsibility transitions, perfectionism, chronic stress, and relationship dynamics. Trained at Columbia University with 11 years of clinical practice.',
    specialties: [
      'Relational Psychotherapy',
      'Cognitive Behavioral Therapy (CBT)',
      'Executive Burnout & Anxiety',
      'Mindfulness-Based Stress Reduction',
    ],
    languages: ['English', 'French'],
    qualifications: [
      'Psy.D. Clinical Psychology — Columbia University',
      'Licensed Psychologist #PSY-89421',
      'Clinical Member, American Psychological Association',
    ],
    sessionTypes: [
      {
        id: 'st_standard',
        name: 'Individual Psychotherapy',
        durationMinutes: 50,
        price: 180,
        currency: 'USD',
        description: 'Standard 50-minute clinical psychotherapy session conducted via secure telehealth or in-clinic.',
      },
      {
        id: 'st_intake',
        name: 'Comprehensive Intake & Evaluation',
        durationMinutes: 75,
        price: 250,
        currency: 'USD',
        description: 'Thorough 75-minute diagnostic evaluation, biopsychosocial assessment, and initial treatment planning.',
      },
      {
        id: 'st_couples',
        name: 'Couples & Relational Consultation',
        durationMinutes: 60,
        price: 220,
        currency: 'USD',
        description: 'Structured 60-minute session focused on communication architecture and conflict resolution.',
      },
    ],
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    slug: 'dr-clara-vance',
    timezone: 'America/New_York',
    bufferMinutes: 15,
    phone: '+1 (212) 555-0192',
    address: '450 Lexington Ave, Suite 1400, New York, NY 10017',
    subscriptionPlan: 'professional',
    subscriptionStatus: 'active',
  });

  const therapistId = therapist._id || therapist.id;

  // Default Availability for Dr. Clara
  await db.availability.create({
    therapistId,
    timeZone: 'America/New_York',
    slotDurationMinutes: 50,
    bufferMinutes: 15,
    minNoticeHours: 12,
    maxAdvanceDays: 45,
    weeklySchedule: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', enabled: true },
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', enabled: true },
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', enabled: true },
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', enabled: true },
      { dayOfWeek: 5, startTime: '10:00', endTime: '15:00', enabled: true },
      { dayOfWeek: 6, startTime: '10:00', endTime: '13:00', enabled: false },
      { dayOfWeek: 0, startTime: '10:00', endTime: '13:00', enabled: false },
    ],
    blackoutDates: [],
  });

  // 2. Client 1: Julian Ross
  const clientUser1 = await db.users.create({
    name: 'Julian Ross',
    email: 'julian.ross@example.com',
    passwordHash,
    role: 'client',
  });

  const client1 = await db.clients.create({
    therapistId,
    userId: clientUser1._id || clientUser1.id,
    name: 'Julian Ross',
    email: 'julian.ross@example.com',
    phone: '+1 (917) 555-3810',
    dateOfBirth: '1989-06-14',
    intakeStatus: 'submitted',
    tags: ['Individual Therapy', 'Anxiety', 'Active'],
    notes: 'Development Demo Data: Senior architect experiencing acute work-related burnout and sleep onset insomnia.',
    status: 'active',
  });

  // Client 2: Maya Lin
  const clientUser2 = await db.users.create({
    name: 'Maya Lin',
    email: 'maya.lin@example.com',
    passwordHash,
    role: 'client',
  });

  const client2 = await db.clients.create({
    therapistId,
    userId: clientUser2._id || clientUser2.id,
    name: 'Maya Lin',
    email: 'maya.lin@example.com',
    phone: '+1 (646) 555-7281',
    dateOfBirth: '1993-11-22',
    intakeStatus: 'reviewed',
    tags: ['Relational', 'Mindfulness', 'Active'],
    notes: 'Development Demo Data: Exploring career pivot and boundary-setting with family members.',
    status: 'active',
  });

  // Client 3: Arthur Pendelton
  const client3 = await db.clients.create({
    therapistId,
    name: 'Arthur Pendelton',
    email: 'arthur.p@example.com',
    phone: '+1 (202) 555-9011',
    dateOfBirth: '1976-03-08',
    intakeStatus: 'pending',
    tags: ['Intake Pending', 'Individual Therapy'],
    notes: 'Development Demo Data: Initial consultation requested regarding bereavement processing.',
    status: 'active',
  });

  // Dates for realistic appointments
  const today = new Date();
  const formatISO = (d: Date, hour: number, min: number = 0) => {
    const copy = new Date(d);
    copy.setHours(hour, min, 0, 0);
    return copy.toISOString();
  };

  const appt1 = await db.appointments.create({
    therapistId,
    clientId: client1._id || client1.id,
    clientName: 'Julian Ross',
    clientEmail: 'julian.ross@example.com',
    startTime: formatISO(today, 10, 0),
    endTime: formatISO(today, 10, 50),
    durationMinutes: 50,
    type: 'Individual Psychotherapy',
    location: 'online',
    fee: 180,
    currency: 'USD',
    paymentStatus: 'paid',
    meetingLink: 'https://telehealth.unlox.care/session/demo-vance-ross-101',
    status: 'confirmed',
    notes: 'Focus on sleep hygiene review and cognitive restructuring around morning anxiety triggers.',
    timezone: 'America/New_York',
  });

  const appt2 = await db.appointments.create({
    therapistId,
    clientId: client2._id || client2.id,
    clientName: 'Maya Lin',
    clientEmail: 'maya.lin@example.com',
    startTime: formatISO(today, 14, 0),
    endTime: formatISO(today, 14, 50),
    durationMinutes: 50,
    type: 'Individual Psychotherapy',
    location: 'online',
    fee: 180,
    currency: 'USD',
    paymentStatus: 'paid',
    meetingLink: 'https://telehealth.unlox.care/session/demo-vance-lin-202',
    status: 'scheduled',
    notes: 'Session 4: Continuing narrative review of interpersonal boundaries.',
    timezone: 'America/New_York',
  });

  // Tomorrow appointment
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  await db.appointments.create({
    therapistId,
    clientId: client3._id || client3.id,
    clientName: 'Arthur Pendelton',
    clientEmail: 'arthur.p@example.com',
    startTime: formatISO(tomorrow, 11, 0),
    endTime: formatISO(tomorrow, 12, 15),
    durationMinutes: 75,
    type: 'Comprehensive Intake & Evaluation',
    location: 'in_person',
    fee: 250,
    currency: 'USD',
    paymentStatus: 'unpaid',
    status: 'scheduled',
    notes: 'Initial clinical evaluation in suite 1400.',
    timezone: 'America/New_York',
  });

  // Realistic Session Note (Strictly Private to Therapist)
  await db.notes.create({
    therapistId,
    clientId: client1._id || client1.id,
    appointmentId: appt1._id || appt1.id,
    sessionDate: today.toISOString().split('T')[0],
    title: 'Session 03: Sleep Hygiene & Cognitive Restructuring',
    subjective: 'Client arrived promptly. Reported persistent middle-of-the-night waking associated with rumination about upcoming firm deliverables. Rated overall weekly distress 6/10.',
    objective: 'Client was well-groomed, attentive, and fully oriented. Speech was regular in rate and tone. Affect was congruent with mild situational anxiety.',
    assessment: 'Client is actively applying grounding diaphragmatic exercises with partial efficacy. Catastrophic thinking patterns identified around deadline perceptions.',
    plan: 'Continue weekly CBT. Homework: Maintain 7-day sleep log and 3-column thought record for late-night ruminations. Next session in one week.',
    generalNotes: '[DEVELOPMENT DEMO DATA] Test clinical note for layout verification.',
    isLocked: false,
    aiAssisted: false,
  });

  // Demo Payment & Invoice
  const payment1 = await db.payments.create({
    therapistId,
    clientId: client1._id || client1.id,
    appointmentId: appt1._id || appt1.id,
    razorpayOrderId: 'order_demo_unlox_99182',
    razorpayPaymentId: 'pay_demo_unlox_88291',
    razorpaySignature: 'demo_sig_verified_development',
    amount: 180,
    currency: 'USD',
    status: 'captured',
    description: 'Individual Psychotherapy — 50 min',
  });

  await db.invoices.create({
    therapistId,
    clientId: client1._id || client1.id,
    clientName: 'Julian Ross',
    paymentId: payment1._id || payment1.id,
    invoiceNumber: 'INV-2026-0042',
    issueDate: today.toISOString().split('T')[0],
    dueDate: today.toISOString().split('T')[0],
    amount: 180,
    currency: 'USD',
    status: 'paid',
    items: [
      {
        description: 'Individual Psychotherapy (50 min)',
        quantity: 1,
        unitPrice: 180,
        amount: 180,
      },
    ],
    notes: 'Settled via Razorpay verified payment.',
  });

  // Demo Messages in conversation
  const convId = `conv_${therapistId}_${client1._id || client1.id}`;
  await db.messages.create({
    conversationId: convId,
    therapistId,
    clientId: client1._id || client1.id,
    senderId: clientUser1._id || clientUser1.id,
    senderRole: 'client',
    text: 'Good morning Dr. Vance, I submitted my sleep log questionnaire yesterday.',
  });

  await db.messages.create({
    conversationId: convId,
    therapistId,
    clientId: client1._id || client1.id,
    senderId: therapistUser._id || therapistUser.id,
    senderRole: 'therapist',
    text: 'Thank you Julian. I reviewed your notes and we will discuss them during our session today.',
  });

  // Demo Notification
  await db.notifications.create({
    userId: therapistUser._id || therapistUser.id,
    therapistId,
    type: 'appointment_booked',
    title: 'Session Today at 10:00 AM',
    message: 'Telehealth appointment with Julian Ross is scheduled for today.',
    read: false,
    link: '/schedule',
    createdAt: new Date(),
  });

  console.log('[UNLOX] Development demo data successfully seeded.');
  console.log('Therapist credentials: dr.clara@unlox.practice / Password123!');
  console.log('Client credentials: julian.ross@example.com / Password123!');
}
