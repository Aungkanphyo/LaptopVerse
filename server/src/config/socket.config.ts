import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { verifyAccessToken } from '../utils/jwt.utils';
import { Message, Conversation } from '../models/chat.model';

export interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    role: 'admin' | 'manager' | 'user' | 'guest';
    isGuest: boolean;
  };
}

let io: Server | null = null;

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    },
    transports: ['websocket', 'polling'],
  });

  // Socket Authentication Middleware (Supports both Auth Users & Guests)
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      const guestId = socket.handshake.auth?.guestId || (socket.handshake.headers?.['x-guest-id'] as string);

      // Registered / Logged-in User Verification
      if (token) {
        try {
          const decoded = verifyAccessToken(token) as { id: string; role: string };
          socket.user = {
            id: decoded.id,
            role: (decoded.role as 'admin' | 'manager' | 'user') || 'user',
            isGuest: false,
          };
          return next();
        } catch (jwtErr) {
          logger.warn(`⚠️ Invalid JWT token on socket auth. Checking guest fallback...`);
        }
      }

      // Guest User Validation
      if (guestId && typeof guestId === 'string' && guestId.trim() !== '') {
        socket.user = {
          id: guestId.trim(),
          role: 'guest',
          isGuest: true,
        };
        return next();
      }

      // Reject if neither token nor guestId is provided
      return next(new Error('Authentication error: Token or Guest ID required'));
    } catch (err) {
      logger.error(err as Error,'❌ Socket middleware authentication error:');
      return next(new Error('Authentication error: Internal server error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.user?.id;
    const userRole = socket.user?.role;
    const isGuest = socket.user?.isGuest;

    logger.info(
      `🔌 [Socket.io] Connected: ${socket.id} | User/Guest ID: ${userId} | Role: ${userRole} | IsGuest: ${isGuest}`
    );

    // Admin/Manager joins the global admin notification room
    if (userRole === 'admin' || userRole === 'manager') {
      socket.join('admin_room');
    }

    // Join Specific Conversation Room (with Authorization Check)
    socket.on('join_conversation', async (conversationId: string) => {
      try {
        if (!conversationId || !userId) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          return socket.emit('error_message', { message: 'Conversation not found.' });
        }

        // Authorization Rule Verification
        const isAdminOrManager = userRole === 'admin' || userRole === 'manager';
        const isOwnerUser = !isGuest && conversation.userId?.toString() === userId;
        const isOwnerGuest = isGuest && conversation.guestId === userId;

        if (!isAdminOrManager && !isOwnerUser && !isOwnerGuest) {
          logger.warn(`⛔ Unauthorized room join attempt by Socket ${socket.id} for conversation ${conversationId}`);
          return socket.emit('error_message', { message: 'Unauthorized access to this conversation.' });
        }

        socket.join(`conversation_${conversationId}`);
        logger.info(`👥 Socket ${socket.id} joined room conversation_${conversationId}`);
      } catch (error) {
        logger.error(error as Error,'Error in join_conversation:');
        socket.emit('error_message', { message: 'Failed to join conversation.' });
      }
    });

    // Handle Real-Time Messaging
    socket.on('send_message', async (data: { conversationId: string; text: string }) => {
      try {
        const { conversationId, text } = data;
        if (!text || typeof text !== 'string' || !text.trim() || text.length > 5000 || !userId) {
          return socket.emit('error_message', { message: 'Invalid or oversized message format.' });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          return socket.emit('error_message', { message: 'Conversation not found.' });
        }

        // Authorization Rule Verification
        const isAdminOrManager = userRole === 'admin' || userRole === 'manager';
        const isOwnerUser = !isGuest && conversation.userId?.toString() === userId;
        const isOwnerGuest = isGuest && conversation.guestId === userId;

        if (!isAdminOrManager && !isOwnerUser && !isOwnerGuest) {
          return socket.emit('error_message', { message: 'Unauthorized action.' });
        }

        // Determine Sender Type
        let senderType: 'admin' | 'user' | 'guest';
        if (isAdminOrManager) {
          senderType = 'admin';
        } else if (isGuest) {
          senderType = 'guest';
        } else {
          senderType = 'user';
        }

        // Create and Save Message
        const message = await Message.create({
          conversationId,
          sender: senderType,
          senderId: userId,
          text: text.trim(),
        });

        const now = new Date();
        const unreadField = senderType === 'admin' ? 'unreadCountUser' : 'unreadCountAdmin';

        await Conversation.findByIdAndUpdate(conversationId, {
          $set: {
            lastMessage: text.trim(),
            lastMessageAt: now,
          },
          $inc: {
            [unreadField]: 1,
          },
        });

        // Emit Message to Conversation Room
        io?.to(`conversation_${conversationId}`).emit('receive_message', message);

        // Notify Admins in Admin Room
        io?.to('admin_room').emit('conversation_updated', {
          conversationId,
          lastMessage: text.trim(),
          updatedAt: conversation.lastMessageAt,
          sender: senderType,
          guestId: isGuest ? userId : undefined,
          userId: !isGuest && !isAdminOrManager ? userId : undefined,
        });

      } catch (error) {
        logger.error(error as Error, 'Error handling send_message in socket:');
        socket.emit('error_message', { message: 'Failed to send message.' });
      }
    });

    // Typing Indicators
    socket.on('typing', (data: { conversationId: string; isTyping: boolean }) => {
      socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
        userId,
        isGuest,
        isTyping: data.isTyping,
      });
    });

    socket.on('disconnect', (reason) => {
      logger.warn(`❌ [Socket.io] Client disconnected: ${socket.id} | Reason: ${reason}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io instance is not initialized!');
  }
  return io;
};