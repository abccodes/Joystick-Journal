import { Router } from 'express';
import {
  fetchGamesData,
  fetchUserData,
  generateGameEmbeddingsWithPCA,
} from '../controllers/recommendationController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/fetchGames', fetchGamesData);
router.get('/fetchUser/:id', fetchUserData);
router.get(
  '/generateEmbeddingsWithPCA',
  authenticate,
  generateGameEmbeddingsWithPCA
);

export default router;
