import { Router } from 'express';
import {
  createReview,
  getReviewById,
  updateReview,
  deleteReview,
} from '../controllers/reviewController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticate, createReview);
router.get('/:id', getReviewById);
router.put('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);

export default router;
