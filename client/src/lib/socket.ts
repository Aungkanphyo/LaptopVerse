import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080';

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
  withCredentials: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on('connect', () => {
  console.log('✅ [Socket.io Client] Connected to server on:', SOCKET_URL);
});

socket.on('connect_error', (error) => {
  console.error('❌ [Socket.io Client] Connection Error:', error.message);
});