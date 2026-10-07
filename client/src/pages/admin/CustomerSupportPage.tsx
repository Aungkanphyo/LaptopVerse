import React, { useState, useEffect, useRef } from 'react';
import {
    chatApiSlice,
    useGetAllConversationsQuery,
    useGetMessagesByConversationQuery,
    useToggleConversationStatusMutation,
} from '@/features/chat/chatApiSlice';
import { socket } from '@/lib/socket';
import { Send, CheckCircle, Clock, User, Headset, UserX } from 'lucide-react';
import type { IChatMessage, IConversation } from '@/types/chat.types';
import { skipToken } from '@reduxjs/toolkit/query';
import { useAppDispatch } from '@/hooks/redux.hooks';

const CustomerSupportPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { data: convRes, isLoading: isConvLoading, refetch: refetchConvs } = useGetAllConversationsQuery();
    const conversations = convRes?.data || convRes?.conversations || [];
    const [selectedConv, setSelectedConv] = useState<IConversation | null>(null);
    const [text, setText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const queryParams = selectedConv
        ? { conversationId: selectedConv._id, guestId: selectedConv.guestId }
        : skipToken;

    // Get Messages for Selected Conversation (Support Guest ID parameter if present)
    const { data: msgRes } = useGetMessagesByConversationQuery(queryParams);
    const [toggleStatus] = useToggleConversationStatusMutation();
    const messages: IChatMessage[] = msgRes?.data || msgRes?.messages || [];

    // Socket updates for Admin
    useEffect(() => {
        if (!selectedConv?._id) return;

        socket.emit('join_conversation', selectedConv._id);

        const handleReceiveMessage = (newMsg: IChatMessage) => {
            if (newMsg.conversationId === selectedConv._id) {
                // 🟢 [CHANGED] setMessages အစား RTK Query Cache ထဲသို့ updateQueryData ဖြင့် တိုက်ရိုက် Push လုပ်ပေးပါသည်
                dispatch(
                    chatApiSlice.util.updateQueryData(
                        'getMessagesByConversation',
                        { conversationId: selectedConv._id, guestId: selectedConv.guestId },
                        (draft) => {
                            const list = draft.data || draft.messages;
                            if (list) {
                                list.push(newMsg);
                            }
                        }
                    )
                );
            }
            refetchConvs();
        };

        socket.on('receive_message', handleReceiveMessage);
        socket.on('conversation_updated', refetchConvs);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.off('conversation_updated', refetchConvs);
        };
    }, [selectedConv?._id, selectedConv?.guestId, dispatch, refetchConvs]);

    useEffect(() => {
        if(messages.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages.length]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || !selectedConv) return;

        socket.emit('send_message', {
            conversationId: selectedConv._id,
            text: text.trim(),
        });
        setText('');
    };

    const handleStatusToggle = async () => {
        if (!selectedConv) return;
        const nextStatus = selectedConv.status === 'open' ? 'closed' : 'open';
        await toggleStatus({ conversationId: selectedConv._id, status: nextStatus });
        setSelectedConv((prev) => (prev ? { ...prev, status: nextStatus } : null));
    };

    return (
        <div className="h-[calc(100vh-100px)] flex border border-slate-800 rounded-2xl bg-[#0d111d] overflow-hidden">
            {/* Conversations List Sidebar */}
            <div className="w-1/3 border-r border-slate-800 flex flex-col">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                    <h2 className="font-semibold text-slate-100 flex items-center gap-2">
                        <Headset className="w-5 h-5 text-blue-500" /> Customer Support Chats
                    </h2>
                </div>
                <div className="grow overflow-y-auto divide-y divide-slate-800/50">
                    {isConvLoading ? (
                        <p className="p-4 text-xs text-slate-500">Loading chats...</p>
                    ) : conversations.length === 0 ? (
                        <p className="p-4 text-xs text-slate-500">No support chats yet.</p>
                    ) : (
                        conversations.map((c) => {
                            const isGuest = !c.userId && Boolean(c.guestId);
                            const displayName = c.userId?.fullName || (isGuest ? `Guest (${c.guestId?.slice(-6)})` : 'User');

                            return (
                                <div
                                    key={c._id}
                                    onClick={() => setSelectedConv(c)}
                                    className={`p-4 cursor-pointer hover:bg-slate-800/40 transition ${selectedConv?._id === c._id ? 'bg-slate-800/80 border-l-4 border-blue-500' : ''
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-medium text-xs text-slate-200 flex items-center gap-1.5">
                                            {isGuest ? (
                                                <UserX className="w-3.5 h-3.5 text-amber-400" />
                                            ) : (
                                                <User className="w-3.5 h-3.5 text-blue-400" />
                                            )}
                                            {displayName}
                                        </span>
                                        <span className="text-[10px] text-slate-500">
                                            {new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-xs text-slate-400 truncate max-w-[70%]">{c.lastMessage || 'No messages'}</p>
                                        <span
                                            className={`text-[9px] px-1.5 py-0.5 rounded ${isGuest ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                }`}
                                        >
                                            {isGuest ? 'Guest' : 'User'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Active Conversation Panel */}
            <div className="w-2/3 flex flex-col bg-[#070913]">
                {selectedConv ? (
                    <>
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                                    {selectedConv.userId?.fullName || `Guest Session (${selectedConv.guestId})`}
                                </h3>
                                <p className="text-xs text-slate-400">
                                    {selectedConv.userId?.email || 'Unauthenticated User'}
                                </p>
                            </div>
                            <button
                                onClick={handleStatusToggle}
                                className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition ${selectedConv.status === 'open'
                                    ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                                    : 'border-slate-700 text-slate-400 hover:bg-slate-800'
                                    }`}
                            >
                                {selectedConv.status === 'open' ? (
                                    <>
                                        <Clock className="w-3.5 h-3.5" /> Mark as Resolved
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-3.5 h-3.5" /> Reopen Ticket
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="grow p-4 overflow-y-auto space-y-3">
                            {messages.map((m) => {
                                const isAdmin = m.sender === 'admin';
                                return (
                                    <div key={m._id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${isAdmin
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/50'
                                                }`}
                                        >
                                            {m.text}
                                            <div
                                                className={`text-[10px] mt-1 text-right ${isAdmin ? 'text-blue-200' : 'text-slate-400'
                                                    }`}
                                            >
                                                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-900/80 flex gap-2">
                            <input
                                type="text"
                                placeholder="Write a reply..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="grow bg-slate-800 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700/60 focus:outline-none focus:border-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={!text.trim()}
                                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1"
                            >
                                <Send className="w-3.5 h-3.5" /> Send
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                        Select a conversation to start messaging
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerSupportPage;