import { Router } from 'express';
import {
  createInquiry,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
  replyInquiry,
} from '../controllers/inquiry.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Public route for form submission
router.post('/', createInquiry);

// Protected Admin routes
router.use(protect, authorize('admin'));

router.get('/', getInquiries);
router.patch('/:id', updateInquiryStatus);
router.post('/:id/reply', replyInquiry);
router.delete('/:id', deleteInquiry);

export default router;