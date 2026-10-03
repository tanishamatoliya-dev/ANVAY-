import {
  UserModel,
  TherapistModel,
  ClientModel,
  AppointmentModel,
  AvailabilityModel,
  SessionNoteModel,
  IntakeFormModel,
  IntakeResponseModel,
  PaymentModel,
  InvoiceModel,
  SubscriptionModel,
  MessageModel,
  NotificationModel,
  IUser,
  ITherapist,
  IClient,
  IAppointment,
  IAvailability,
  ISessionNote,
  IIntakeForm,
  IIntakeResponse,
  IPayment,
  IInvoice,
  ISubscription,
  IMessage,
  INotification,
} from '../models/schemas.js';
import { dbStatus } from '../config/db.js';

// Resilient memory collections to guarantee smooth operation
class MemoryCollection<T extends { _id?: string; id?: string }> {
  private items: Map<string, T> = new Map();

  constructor(public name: string) {}

  async find(filter: Partial<T> | ((item: T) => boolean) = {}): Promise<T[]> {
    const all = Array.from(this.items.values());
    if (typeof filter === 'function') {
      return all.filter(filter);
    }
    const entries = Object.entries(filter);
    if (entries.length === 0) return all;
    return all.filter(item =>
      entries.every(([k, v]) => (item as any)[k] === v)
    );
  }

  async findOne(filter: Partial<T> | ((item: T) => boolean)): Promise<T | null> {
    const res = await this.find(filter);
    return res[0] || null;
  }

  async findById(id: string): Promise<T | null> {
    return this.items.get(id) || null;
  }

  async create(data: Partial<T>): Promise<T> {
    const id = data._id || data.id || `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();
    const doc = {
      ...data,
      _id: id,
      id,
      createdAt: (data as any).createdAt || now,
      updatedAt: now,
    };
    this.items.set(id, doc as unknown as T);
    return doc as unknown as T;
  }

  async findByIdAndUpdate(id: string, update: Partial<T>): Promise<T | null> {
    const existing = this.items.get(id);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...update,
      updatedAt: new Date(),
    };
    this.items.set(id, updated);
    return updated;
  }

  async findByIdAndDelete(id: string): Promise<boolean> {
    return this.items.delete(id);
  }

  async count(filter?: Partial<T>): Promise<number> {
    const res = await this.find(filter);
    return res.length;
  }

  clear() {
    this.items.clear();
  }
}

export const memUsers = new MemoryCollection<any>('users');
export const memTherapists = new MemoryCollection<any>('therapists');
export const memClients = new MemoryCollection<any>('clients');
export const memAppointments = new MemoryCollection<any>('appointments');
export const memAvailability = new MemoryCollection<any>('availability');
export const memSessionNotes = new MemoryCollection<any>('sessionNotes');
export const memIntakeForms = new MemoryCollection<any>('intakeForms');
export const memIntakeResponses = new MemoryCollection<any>('intakeResponses');
export const memPayments = new MemoryCollection<any>('payments');
export const memInvoices = new MemoryCollection<any>('invoices');
export const memSubscriptions = new MemoryCollection<any>('subscriptions');
export const memMessages = new MemoryCollection<any>('messages');
export const memNotifications = new MemoryCollection<any>('notifications');

// Store accessor that uses Mongoose when connected or memory when Atlas is standby
export const db = {
  isAtlas(): boolean {
    return dbStatus.connected && dbStatus.type === 'atlas';
  },

  users: {
    async findOne(query: any) {
      if (db.isAtlas()) return UserModel.findOne(query).lean();
      return memUsers.findOne(query);
    },
    async findById(id: string) {
      if (db.isAtlas()) return UserModel.findById(id).lean();
      return memUsers.findById(id);
    },
    async create(data: any) {
      if (db.isAtlas()) return UserModel.create(data);
      return memUsers.create(data);
    },
    async find() {
      if (db.isAtlas()) return UserModel.find().lean();
      return memUsers.find();
    }
  },

  therapists: {
    async findOne(query: any) {
      if (db.isAtlas()) return TherapistModel.findOne(query).lean();
      return memTherapists.findOne(query);
    },
    async findById(id: string) {
      if (db.isAtlas()) return TherapistModel.findById(id).lean();
      return memTherapists.findById(id);
    },
    async find() {
      if (db.isAtlas()) return TherapistModel.find().lean();
      return memTherapists.find();
    },
    async create(data: any) {
      if (db.isAtlas()) return TherapistModel.create(data);
      return memTherapists.create(data);
    },
    async update(id: string, data: any) {
      if (db.isAtlas()) return TherapistModel.findByIdAndUpdate(id, data, { new: true }).lean();
      return memTherapists.findByIdAndUpdate(id, data);
    }
  },

  clients: {
    async find(query: any) {
      if (db.isAtlas()) return ClientModel.find(query).sort({ createdAt: -1 }).lean();
      return memClients.find(query);
    },
    async findById(id: string) {
      if (db.isAtlas()) return ClientModel.findById(id).lean();
      return memClients.findById(id);
    },
    async findOne(query: any) {
      if (db.isAtlas()) return ClientModel.findOne(query).lean();
      return memClients.findOne(query);
    },
    async create(data: any) {
      if (db.isAtlas()) return ClientModel.create(data);
      return memClients.create(data);
    },
    async update(id: string, data: any) {
      if (db.isAtlas()) return ClientModel.findByIdAndUpdate(id, data, { new: true }).lean();
      return memClients.findByIdAndUpdate(id, data);
    },
    async count(query: any) {
      if (db.isAtlas()) return ClientModel.countDocuments(query);
      return memClients.count(query);
    }
  },

  appointments: {
    async find(query: any = {}) {
      if (db.isAtlas()) return AppointmentModel.find(query).sort({ startTime: 1 }).lean();
      const list = await memAppointments.find(query);
      return list.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    },
    async findById(id: string) {
      if (db.isAtlas()) return AppointmentModel.findById(id).lean();
      return memAppointments.findById(id);
    },
    async create(data: any) {
      if (db.isAtlas()) return AppointmentModel.create(data);
      return memAppointments.create(data);
    },
    async update(id: string, data: any) {
      if (db.isAtlas()) return AppointmentModel.findByIdAndUpdate(id, data, { new: true }).lean();
      return memAppointments.findByIdAndUpdate(id, data);
    },
    async delete(id: string) {
      if (db.isAtlas()) return AppointmentModel.findByIdAndDelete(id);
      return memAppointments.findByIdAndDelete(id);
    },
    async count(query: any = {}) {
      if (db.isAtlas()) return AppointmentModel.countDocuments(query);
      return memAppointments.count(query);
    }
  },

  availability: {
    async findOne(query: any) {
      if (db.isAtlas()) return AvailabilityModel.findOne(query).lean();
      return memAvailability.findOne(query);
    },
    async create(data: any) {
      if (db.isAtlas()) return AvailabilityModel.create(data);
      return memAvailability.create(data);
    },
    async update(therapistId: string, data: any) {
      if (db.isAtlas()) {
        return AvailabilityModel.findOneAndUpdate({ therapistId }, data, { new: true, upsert: true }).lean();
      }
      const existing = await memAvailability.findOne({ therapistId });
      if (existing) {
        return memAvailability.findByIdAndUpdate(existing._id, data);
      }
      return memAvailability.create({ ...data, therapistId });
    }
  },

  notes: {
    async find(query: any) {
      if (db.isAtlas()) return SessionNoteModel.find(query).sort({ sessionDate: -1 }).lean();
      const res = await memSessionNotes.find(query);
      return res.sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
    },
    async findById(id: string) {
      if (db.isAtlas()) return SessionNoteModel.findById(id).lean();
      return memSessionNotes.findById(id);
    },
    async create(data: any) {
      if (db.isAtlas()) return SessionNoteModel.create(data);
      return memSessionNotes.create(data);
    },
    async update(id: string, data: any) {
      if (db.isAtlas()) return SessionNoteModel.findByIdAndUpdate(id, data, { new: true }).lean();
      return memSessionNotes.findByIdAndUpdate(id, data);
    },
    async delete(id: string) {
      if (db.isAtlas()) return SessionNoteModel.findByIdAndDelete(id);
      return memSessionNotes.findByIdAndDelete(id);
    }
  },

  intakeForms: {
    async findOne(query: any) {
      if (db.isAtlas()) return IntakeFormModel.findOne(query).lean();
      return memIntakeForms.findOne(query);
    },
    async create(data: any) {
      if (db.isAtlas()) return IntakeFormModel.create(data);
      return memIntakeForms.create(data);
    }
  },

  intakeResponses: {
    async find(query: any) {
      if (db.isAtlas()) return IntakeResponseModel.find(query).sort({ submittedAt: -1 }).lean();
      return memIntakeResponses.find(query);
    },
    async findOne(query: any) {
      if (db.isAtlas()) return IntakeResponseModel.findOne(query).lean();
      return memIntakeResponses.findOne(query);
    },
    async create(data: any) {
      if (db.isAtlas()) return IntakeResponseModel.create(data);
      return memIntakeResponses.create(data);
    },
    async update(id: string, data: any) {
      if (db.isAtlas()) return IntakeResponseModel.findByIdAndUpdate(id, data, { new: true }).lean();
      return memIntakeResponses.findByIdAndUpdate(id, data);
    }
  },

  payments: {
    async find(query: any) {
      if (db.isAtlas()) return PaymentModel.find(query).sort({ createdAt: -1 }).lean();
      return memPayments.find(query);
    },
    async findOne(query: any) {
      if (db.isAtlas()) return PaymentModel.findOne(query).lean();
      return memPayments.findOne(query);
    },
    async create(data: any) {
      if (db.isAtlas()) return PaymentModel.create(data);
      return memPayments.create(data);
    },
    async update(id: string, data: any) {
      if (db.isAtlas()) return PaymentModel.findByIdAndUpdate(id, data, { new: true }).lean();
      return memPayments.findByIdAndUpdate(id, data);
    }
  },

  invoices: {
    async find(query: any) {
      if (db.isAtlas()) return InvoiceModel.find(query).sort({ issueDate: -1 }).lean();
      return memInvoices.find(query);
    },
    async findById(id: string) {
      if (db.isAtlas()) return InvoiceModel.findById(id).lean();
      return memInvoices.findById(id);
    },
    async create(data: any) {
      if (db.isAtlas()) return InvoiceModel.create(data);
      return memInvoices.create(data);
    },
    async update(id: string, data: any) {
      if (db.isAtlas()) return InvoiceModel.findByIdAndUpdate(id, data, { new: true }).lean();
      return memInvoices.findByIdAndUpdate(id, data);
    }
  },

  subscriptions: {
    async findOne(query: any) {
      if (db.isAtlas()) return SubscriptionModel.findOne(query).lean();
      return memSubscriptions.findOne(query);
    },
    async create(data: any) {
      if (db.isAtlas()) return SubscriptionModel.create(data);
      return memSubscriptions.create(data);
    },
    async update(therapistId: string, data: any) {
      if (db.isAtlas()) {
        return SubscriptionModel.findOneAndUpdate({ therapistId }, data, { new: true, upsert: true }).lean();
      }
      const existing = await memSubscriptions.findOne({ therapistId });
      if (existing) {
        return memSubscriptions.findByIdAndUpdate(existing._id, data);
      }
      return memSubscriptions.create({ ...data, therapistId });
    }
  },

  messages: {
    async find(query: any) {
      if (db.isAtlas()) return MessageModel.find(query).sort({ createdAt: 1 }).lean();
      const res = await memMessages.find(query);
      return res.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    },
    async create(data: any) {
      if (db.isAtlas()) return MessageModel.create(data);
      return memMessages.create(data);
    },
    async markAsRead(conversationId: string, readerRole: 'therapist' | 'client') {
      const otherRole = readerRole === 'therapist' ? 'client' : 'therapist';
      if (db.isAtlas()) {
        return MessageModel.updateMany(
          { conversationId, senderRole: otherRole, readAt: { $exists: false } },
          { $set: { readAt: new Date() } }
        );
      }
      const list = await memMessages.find({ conversationId, senderRole: otherRole });
      for (const m of list) {
        if (!m.readAt) {
          await memMessages.findByIdAndUpdate(m._id, { readAt: new Date() });
        }
      }
    }
  },

  notifications: {
    async find(query: any) {
      if (db.isAtlas()) return NotificationModel.find(query).sort({ createdAt: -1 }).limit(30).lean();
      const res = await memNotifications.find(query);
      return res.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    async create(data: any) {
      if (db.isAtlas()) return NotificationModel.create(data);
      return memNotifications.create(data);
    },
    async markAsRead(id: string) {
      if (db.isAtlas()) return NotificationModel.findByIdAndUpdate(id, { read: true });
      return memNotifications.findByIdAndUpdate(id, { read: true });
    },
    async markAllAsRead(userId: string) {
      if (db.isAtlas()) return NotificationModel.updateMany({ userId }, { $set: { read: true } });
      const list = await memNotifications.find({ userId });
      for (const n of list) {
        await memNotifications.findByIdAndUpdate(n._id, { read: true });
      }
    }
  }
};
