import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_SERVER_URL || 'http://localhost:8080';

// Global socket instance
export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5, 
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

export const getOrCreateGuestId = (): string => {
  let guestId = localStorage.getItem('chat_guest_id');
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('chat_guest_id', guestId);
  }
  return guestId;
};

// Connect using a Token or Guest ID
export const connectSocket = (token?: string, customGuestId?: string): void => {
  if (socket.connected) {
    socket.disconnect();
  }

  const guestId = !token ? (customGuestId || getOrCreateGuestId()) : undefined;

  socket.auth = {
    token: token || undefined,
    guestId: guestId || undefined,
  };

  socket.connect();
};

socket.on('connect', () => {
  console.log('✅ [Socket.io Client] Connected to server with ID:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('❌ [Socket.io Client] Connection Error:', error.message);
});

socket.on('disconnect', (reason) => {
  console.warn('⚠️ [Socket.io Client] Disconnected. Reason:', reason);
  if (reason === 'io server disconnect') {
    socket.connect();
  }
});