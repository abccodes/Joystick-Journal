import { Router } from 'express';
import {
  fetchGamesData,
  fetchUserData,
  generateGameEmbeddingsWithPCA,
} from '../controllers/recommendationController';

const router = Router();

/**
 * Route: GET /fetchGames
 * Description: Fetches data for all games from the database or external API.
 * Controller: fetchGamesData
 * Response:
 * - 200: Successfully fetched game data.
 * - 500: Internal server error while fetching data.
 */
router.get('/fetchGames', fetchGamesData);

/**
 * Route: GET /fetchUser/:id
 * Description: Fetches recommendation-related data for a specific user by ID.
 * Controller: fetchUserData
 * URL Parameters:
 * - id: The ID of the user whose data is being fetched.
 * Response:
 * - 200: Successfully fetched user data.
 * - 404: User not found.
 * - 500: Internal server error while fetching data.
 */
router.get('/fetchUser/:id', fetchUserData);

/**
 * Route: GET /generateEmbeddingsWithPCA
 * Description: Generates game embeddings using PCA for dimensionality reduction.
 * Controller: generateGameEmbeddingsWithPCA
 * Response:
 * - 200: Successfully generated embeddings.
 * - 500: Internal server error during embedding generation.
 */
router.get('/generateEmbeddingsWithPCA', generateGameEmbeddingsWithPCA);

export default router;
