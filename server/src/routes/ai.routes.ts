import { Router } from 'express';
import { askAiAdvisor } from '../controllers/ai.controller';

const router = Router();

// POST /api/v1/ai/ask
router.post('/ask', askAiAdvisor);

export default router;