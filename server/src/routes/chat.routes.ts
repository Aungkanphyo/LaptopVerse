import { Router } from 'express';
import {
    getOrCreateConversation,
    getMessages,
    markAsRead
} from '../controllers/chat.controller';
import { optionalAuth } from '../middlewares/auth.middleware';

const router = Router();

// Optional Auth (Supports both Logged-in Users & Guests)
router.post('/conversation', optionalAuth, getOrCreateConversation);
router.get('/conversation/:conversationId/messages', optionalAuth, getMessages);
router.patch('/conversation/:conversationId/read', optionalAuth, markAsRead);

export default router;