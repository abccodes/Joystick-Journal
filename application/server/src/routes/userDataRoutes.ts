import { Router } from 'express';
import {
  createUserData,
  getUserDataById,
  updateUserData,
  deleteUserData,
  getRecommendations,
  fetchUserData,
} from '../controllers/userDataController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

/**
 * Route: GET /:id
 * Description: Fetch user data by user ID.
 * Middleware: Requires authentication.
 * URL Parameters:
 * - id: The ID of the user whose data is being requested.
 * Response:
 * - 200: Successfully retrieved user data.
 * - 404: User data not found.
 * - 500: Internal server error during data retrieval.
 */
router.get('/:id', authenticate, getUserDataById);

/**
 * Route: PUT /:id
 * Description: Update user data by user ID.
 * Middleware: Requires authentication.
 * URL Parameters:
 * - id: The ID of the user whose data is being updated.
 * Request Body:
 * - JSON object containing fields to be updated (e.g., preferences, game history).
 * Response:
 * - 200: Successfully updated user data.
 * - 404: User data not found.
 * - 500: Internal server error during update.
 */
router.put('/:id', authenticate, updateUserData);

/**
 * Route: DELETE /:id
 * Description: Delete user data by user ID.
 * Middleware: Requires authentication.
 * URL Parameters:
 * - id: The ID of the user whose data is being deleted.
 * Response:
 * - 200: Successfully deleted user data.
 * - 404: User data not found.
 * - 500: Internal server error during deletion.
 */
router.delete('/:id', authenticate, deleteUserData);

/**
 * Route: GET /:id/recommendations
 * Description: Fetch game recommendations for a user by user ID.
 * Middleware: Requires authentication.
 * URL Parameters:
 * - id: The ID of the user for whom recommendations are being fetched.
 * Response:
 * - 200: Successfully retrieved recommendations.
 * - 404: User data not found for recommendations.
 * - 500: Internal server error during recommendation retrieval.
 */
router.get('/:id/recommendations', authenticate, getRecommendations);

/**
 * Route: POST /
 * Description: Create new user data.
 * Middleware: Requires authentication.
 * Request Body:
 * - JSON object containing user data fields (e.g., preferences, game history).
 * Response:
 * - 201: Successfully created user data.
 * - 500: Internal server error during creation.
 */
router.post('/', authenticate, createUserData);

/**
 * Route: GET /:id/fetch
 * Description: Fetch user data by user ID (legacy or internal-use route).
 * Middleware: Requires authentication.
 * URL Parameters:
 * - id: The ID of the user whose data is being fetched.
 * Response:
 * - 200: Successfully retrieved user data.
 * - 404: User data not found.
 * - 500: Internal server error during data retrieval.
 */
router.get('/:id/fetch', authenticate, fetchUserData);

export default router;
