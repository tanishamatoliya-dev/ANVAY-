import { Response } from 'express';
import { db } from '../store/dbStore.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { notificationService } from '../services/notificationService.js';
import { getSocketIO } from '../config/socket.js';

export async function getConversations(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated.' });
    }

    if (req.user.role === 'therapist') {
      const therapist = await db.therapists.findOne({ userId: req.user.id });
      if (!therapist) return res.status(404).json({ error: 'NotFound', message: 'Therapist not found.' });

      const therapistId = therapist._id || therapist.id;
      const clients = await db.clients.find({ therapistId });

      const conversations = await Promise.all(
        clients.map(async (client: any) => {
          const clientId = client._id || client.id;
          const conversationId = `conv_${therapistId}_${clientId}`;
          const messages = await db.messages.find({ conversationId });
          const lastMessage = messages[messages.length - 1] || null;
          const unreadCount = messages.filter((m: any) => m.senderRole === 'client' && !m.readAt).length;

          return {
            conversationId,
            clientId,
            clientName: client.name,
            clientEmail: client.email,
            lastMessage,
            unreadCount,
          };
        })
      );

      res.json(conversations);
    } else if (req.user.role === 'client') {
      const client = await db.clients.findOne({ userId: req.user.id });
      if (!client) return res.status(404).json({ error: 'NotFound', message: 'Client not found.' });

      const therapist = await db.therapists.findById(client.therapistId);
      const conversationId = `conv_${client.therapistId}_${client._id || client.id}`;
      const messages = await db.messages.find({ conversationId });
      const lastMessage = messages[messages.length - 1] || null;
      const unreadCount = messages.filter((m: any) => m.senderRole === 'therapist' && !m.readAt).length;

      res.json([
        {
          conversationId,
          therapistId: client.therapistId,
          therapistName: therapist?.professionalName || 'Your Therapist',
          lastMessage,
          unreadCount,
        },
      ]);
    }
  } catch (err: any) {
    res.status(500).json({ error: 'ConversationError', message: err.message });
  }
}

export async function getMessages(req: AuthenticatedRequest, res: Response) {
  try {
    const { conversationId } = req.params;
    const messages = await db.messages.find({ conversationId });

    if (req.user) {
      await db.messages.markAsRead(conversationId, req.user.role as any);
    }

    res.json(messages);
  } catch (err: any) {
    res.status(500).json({ error: 'GetMessagesError', message: err.message });
  }
}

export async function sendMessage(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated.' });
    }

    const { conversationId, therapistId, clientId, text } = req.body;
    if (!conversationId || !text || text.trim() === '') {
      return res.status(400).json({ error: 'ValidationError', message: 'Conversation ID and message text are required.' });
    }

    const senderRole = req.user.role === 'client' ? 'client' : 'therapist';

    const msg = await db.messages.create({
      conversationId,
      therapistId,
      clientId,
      senderId: req.user.id,
      senderRole,
      text: text.trim(),
    });

    // Real-time broadcast via Socket.io
    const io = getSocketIO();
    if (io) {
      io.to(conversationId).emit('new_message', msg);
    }

    // Send push notification to the counterpart
    if (senderRole === 'client') {
      const therapist = await db.therapists.findById(therapistId);
      const client = await db.clients.findById(clientId);
      if (therapist) {
        await notificationService.send({
          userId: therapist.userId,
          therapistId,
          type: 'message_received',
          title: `New message from ${client?.name || 'Client'}`,
          message: text.slice(0, 100),
          link: '/messages',
        });
      }
    } else {
      const client = await db.clients.findById(clientId);
      if (client && client.userId) {
        await notificationService.send({
          userId: client.userId,
          therapistId,
          type: 'message_received',
          title: 'New message from your Therapist',
          message: text.slice(0, 100),
          link: '/portal/messages',
        });
      }
    }

    res.status(201).json(msg);
  } catch (err: any) {
    res.status(500).json({ error: 'SendMessageError', message: err.message });
  }
}
