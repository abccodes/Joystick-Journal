import { Router } from 'express';
import {
  createReview,
  getReviewById,
  getReviewByGameId,
  updateReview,
  deleteReview,
} from '../controllers/reviewController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

//router.post('/', authenticate, createReview); //commented out to test createReview w/no auth
router.post('/', createReview) //testing createReview with no auth
router.get('/:id', getReviewById);
router.get('/game/:gameId', getReviewByGameId);
router.put('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);

export default router;
