import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';

let io: Server | null = null;

export interface StockUpdatePayload {
    products: Array<{
        productId: string;
        newStock: number;
    }>;
}

export const initSocket = (httpServer: HttpServer): Server => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        },
        transports: ['websocket', 'polling'],
    });

    io.on('connection', (socket: Socket) => {
        logger.info(`🔌 [Socket.io] Client connected successfully: ${socket.id}`);
        // Connected clients management
        socket.on('disconnect', (reason) => {
            // For use with a logger or for monitoring
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