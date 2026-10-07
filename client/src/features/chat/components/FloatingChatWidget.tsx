import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MessageSquare, X, Send, Loader2, Headset, Circle } from 'lucide-react';
import { useAppSelector } from '@/hooks/redux.hooks';
import { useGetMyConversationQuery, useGetMessagesByConversationQuery } from '../chatApiSlice';
import { socket, connectSocket } from '@/lib/socket';
import type { IChatMessage } from '@/types/chat.types';

// Guest ID Management Helper
const getOrCreateGuestId = (): string => {
  let guestId = localStorage.getItem('chat_guest_id');
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('chat_guest_id', guestId);
  }
  return guestId;
};

const FloatingChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [liveMessages, setLiveMessages] = useState<IChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, accessToken } = useAppSelector((state) => state.auth);

  // If not an Authenticated User, Guest ID will be obtained from LocalStorage
  const guestId = !isAuthenticated ? getOrCreateGuestId() : undefined;

  // Fetch or Create Conversation (using Logged-in User or Guest ID)
  const { data: convRes, isLoading: isConvLoading } = useGetMyConversationQuery(
    guestId ? { guestId } : undefined
  );

  const conversation = convRes?.data || convRes?.conversation;
  const conversationId = conversation?._id;

  // Fetch Message History (Include Guest ID)
  const { data: msgRes, isLoading: isMsgLoading } = useGetMessagesByConversationQuery(
    { conversationId: conversationId!, guestId },
    { skip: !conversationId || !isOpen }
  );

  const allMessages = useMemo(() => {
    const historyMessages = msgRes?.data || msgRes?.messages || [];
    
    // To avoid duplicates (remove messages already in the history from the live feed)
    const historyIds = new Set(historyMessages.map((m: IChatMessage) => m._id));
    const uniqueLiveMessages = liveMessages.filter((m) => !historyIds.has(m._id));

    return [...historyMessages, ...uniqueLiveMessages];
  }, [msgRes, liveMessages]);

  // Socket Connection setup for both Authenticated & Guest users
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      connectSocket(accessToken);
    } else if (!isAuthenticated && guestId) {
      connectSocket(undefined, guestId);
    }
  }, [isAuthenticated, accessToken, guestId]);

  // Handle Socket Events
  useEffect(() => {
    if (!conversationId) return;

    // Join conversation room
    socket.emit('join_conversation', conversationId);

    const handleReceiveMessage = (newMessage: IChatMessage) => {
      if (newMessage.conversationId === conversationId) {
        setLiveMessages((prev) => [...prev, newMessage]);
      }
    };

    const handleUserTyping = (data: { userId: string; isTyping: boolean }) => {
      const myId = isAuthenticated ? user?._id : guestId;
      if (data.userId !== myId) {
        setIsTyping(data.isTyping);
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
    };
  }, [conversationId, isOpen, isAuthenticated, user?._id, guestId]);

  // Auto Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [allMessages, isOpen, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !conversationId) return;

    socket.emit('send_message', {
      conversationId,
      text: messageText.trim(),
    });

    setMessageText('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-120 bg-[#0d111d] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200">
          {/* Header */}
          <div className="bg-slate-900/90 border-b border-slate-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative p-2 bg-blue-600/20 text-blue-400 rounded-lg">
                <Headset className="w-5 h-5" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-100">LaptopVerse Support</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <span>Real-time Customer Care</span>
                  {!isAuthenticated && (
                    <span className="bg-slate-800 text-slate-400 text-[10px] px-1.5 py-0.5 rounded border border-slate-700">
                      Guest Mode
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="grow p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
            {isConvLoading || isMsgLoading ? (
              <div className="h-full flex items-center justify-center text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : allMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                <p className="text-sm font-medium text-slate-200">Welcome 👋</p>
                <p className="text-xs text-slate-400 mt-1">
                  Welcome to LaptopVerse. Feel free to ask anything you'd like to know.
                </p>
              </div>
            ) : (
              allMessages.map((msg) => {
                const isMe = msg.sender === 'user' || msg.sender === 'guest';
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/50'
                      }`}
                    >
                      {msg.text}
                      <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-400 text-xs px-3 py-2 rounded-xl flex items-center gap-1">
                  <Circle className="w-2 h-2 animate-ping bg-blue-500 rounded-full" /> Support Agent Responding...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer (Both Auth & Guest users can type) */}
          <form onSubmit={handleSendMessage} className="p-3 bg-slate-900/80 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Type here..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="grow bg-slate-800/80 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700/60 focus:outline-none focus:border-blue-500 transition"
            />
            <button
              type="submit"
              disabled={!messageText.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2 rounded-xl transition flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group p-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
        </span>
      </button>
    </div>
  );
};

export default FloatingChatWidget;