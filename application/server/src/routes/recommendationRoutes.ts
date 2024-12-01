import { Router } from 'express';
import {
  fetchGamesData,
  fetchUserData,
  generateGameEmbeddingsWithPCA,
} from '../controllers/recommendationController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

/**
 * Route: GET /games
 * Description: Fetches data for all games from the database or external API.
 * Controller: fetchGamesData
 * Response:
 * - 200: Successfully fetched game data.
 * - 500: Internal server error while fetching data.
 */
router.get('/games', fetchGamesData);

/**
 * Route: GET /user/:id
 * Description: Fetches recommendation-related data for a specific user by ID.
 * Middleware: authenticate
 * Controller: fetchUserData
 * URL Parameters:
 * - id: The ID of the user whose data is being fetched.
 * Response:
 * - 200: Successfully fetched user data.
 * - 401: Unauthorized if the user is not logged in.
 * - 404: User not found.
 * - 500: Internal server error while fetching data.
 */
router.get('/user/:id', authenticate, fetchUserData);

/**
 * Route: GET /embeddings/pca
 * Description: Generates game embeddings using PCA for dimensionality reduction.
 * Middleware: authenticate
 * Controller: generateGameEmbeddingsWithPCA
 * Response:
 * - 200: Successfully generated embeddings.
 * - 401: Unauthorized if the user is not logged in.
 * - 500: Internal server error during embedding generation.
 */
router.get('/embeddings/pca', authenticate, generateGameEmbeddingsWithPCA);

export default router;
