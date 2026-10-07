import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  sender: 'user' | 'admin' | 'guest';
  senderId: string;
  text: string;
  createdAt: Date;
}

export interface IConversation extends Document {
  userId?: mongoose.Types.ObjectId;
  guestId?: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCountAdmin: number;
  unreadCountUser: number;
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    sender: { type: String, enum: ['user', 'admin', 'guest'], required: true },
    senderId: { type: String, required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const ConversationSchema = new Schema<IConversation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    guestId: { type: String, required: false, index: true },
    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: Date, default: Date.now },
    unreadCountAdmin: { type: Number, default: 0 },
    unreadCountUser: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
  },
  { timestamps: true }
);

// Optimize query searches
ConversationSchema.index({ guestId: 1, status: 1 });
ConversationSchema.index({ userId: 1, status: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);