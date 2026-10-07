import { Request, Response } from 'express';
import { Conversation, Message } from '../models/chat.model';
import User from '../models/user.model';

// 1. Guest သို့မဟုတ် Authenticated User အတွက် Conversation ရယူရန် သို့မဟုတ် သစ်တစ်ခု ဖန်တီးရန်
export const getOrCreateConversation = async (req: Request, res: Response) => {
    try {
        const { guestId } = req.body;
        const userId = req.userId || req.user?._id?.toString();

        if (!userId && (!guestId || typeof guestId !== 'string')) {
            return res.status(400).json({
                success: false,
                message: 'Either authenticated User ID or Guest ID is required.'
            });
        }

        let conversation;

        if (userId) {
            // Registered User Conversation Search or Create
            conversation = await Conversation.findOne({ userId, status: 'active' });
            if (!conversation) {
                conversation = await Conversation.create({ userId });
            }
        } else if (guestId) {
            // Guest User Conversation Search or Create
            conversation = await Conversation.findOne({ guestId, status: 'active' });
            if (!conversation) {
                conversation = await Conversation.create({ guestId });
            }
        }

        return res.status(200).json({
            success: true,
            conversation,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to process conversation request.',
            error
        });
    }
};

// 2. Conversation တစ်ခု၏ Message History အားလုံးကို ဆွဲထုတ်ခြင်း
export const getMessages = async (req: Request, res: Response) => {
    try {
        const { conversationId } = req.params;
        const { guestId } = req.query;
        const userId = req.userId || req.user?._id?.toString();
        let userRole = req.role || req.user?.role;
        if (userId && !userRole) {
            const user = await User.findById(userId).select('role');
            if (user) userRole = user.role;
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found.' });
        }

        // Access Control Authorization
        const isAdminOrManager = userRole === 'admin' || userRole === 'manager';
        const isOwnerUser = userId && conversation.userId?.toString() === userId;
        const isOwnerGuest = guestId && conversation.guestId === guestId;

        if (!isAdminOrManager && !isOwnerUser && !isOwnerGuest) {
            return res.status(403).json({ success: false, message: 'Unauthorized access to messages.' });
        }

        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            messages,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve messages.',
            error
        });
    }
};

// 3. Unread Count ကို Reset ပြုလုပ်ခြင်း (Read Messages)
export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { conversationId } = req.params;
        const { guestId } = req.body;
        const userId = req.userId || req.user?._id?.toString();
        let userRole = req.role || req.user?.role;
        if (userId && !userRole) {
            const user = await User.findById(userId).select('role');
            if (user) userRole = user.role;
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found.' });
        }

        const isAdminOrManager = userRole === 'admin' || userRole === 'manager';

        if (isAdminOrManager) {
            conversation.unreadCountAdmin = 0;
        } else {
            const isOwnerUser = userId && conversation.userId?.toString() === userId;
            const isOwnerGuest = guestId && conversation.guestId === guestId;

            if (!isOwnerUser && !isOwnerGuest) {
                return res.status(403).json({ success: false, message: 'Unauthorized action.' });
            }
            conversation.unreadCountUser = 0;
        }

        await conversation.save();

        return res.status(200).json({
            success: true,
            message: 'Messages marked as read.',
            conversation
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to mark messages as read.',
            error
        });
    }
};