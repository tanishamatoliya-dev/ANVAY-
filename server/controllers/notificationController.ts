import { Response } from 'express';
import { db } from '../store/dbStore.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function listNotifications(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated.' });
    }

    const notifications = await db.notifications.find({ userId: req.user.id });
    res.json(notifications);
  } catch (err: any) {
    res.status(500).json({ error: 'NotificationError', message: err.message });
  }
}

export async function markNotificationRead(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    await db.notifications.markAsRead(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'NotificationError', message: err.message });
  }
}

export async function markAllNotificationsRead(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated.' });
    }

    await db.notifications.markAllAsRead(req.user.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'NotificationError', message: err.message });
  }
}
