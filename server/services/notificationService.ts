import { db } from '../store/dbStore.js';

export interface CreateNotificationParams {
  userId: string;
  therapistId?: string;
  type: 'appointment_booked' | 'appointment_cancelled' | 'payment_completed' | 'intake_submitted' | 'message_received' | 'reminder';
  title: string;
  message: string;
  link?: string;
}

export class NotificationService {
  async send(params: CreateNotificationParams) {
    const notification = await db.notifications.create({
      ...params,
      read: false,
      createdAt: new Date(),
    });
    return notification;
  }

  async getForUser(userId: string) {
    return db.notifications.find({ userId });
  }

  async markAsRead(id: string) {
    return db.notifications.markAsRead(id);
  }

  async markAllAsRead(userId: string) {
    return db.notifications.markAllAsRead(userId);
  }
}

export const notificationService = new NotificationService();
