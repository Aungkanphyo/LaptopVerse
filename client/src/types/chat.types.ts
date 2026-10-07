import type { IUser } from "./auth.types";


export interface IChatMessage {
  _id: string;
  conversationId: string;
  sender: 'user' | 'admin' | 'guest';
  senderId: string;
  text: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IConversation {
  _id: string;
  guestId?: string;
  userId: IUser;
  assignedAdminId?: IUser;
  status: 'open' | 'closed';
  lastMessage: string;
  lastMessageAt: string;
  unreadCountUser: number;
  unreadCountAdmin: number;
  createdAt: string;
  updatedAt: string;
}