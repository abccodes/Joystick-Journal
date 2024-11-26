import { Router } from 'express';
import {
  createUserData,
  getUserDataById,
  updateUserData,
  deleteUserData,
  getRecommendations,
} from '../controllers/userDataController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

/**
 * Route: GET /:id
 * Description: Fetch user data by ID.
 * Middleware: Requires authentication.
 * URL Parameters:
 * - id: The ID of the user whose data is being requested.
 */
router.get('/:id', authenticate, getUserDataById);

/**
 * Route: PUT /:id
 * Description: Update user data by ID.
 * Middleware: Requires authentication.
 * URL Parameters:
 * - id: The ID of the user whose data is being updated.
 * Request Body:
 * - JSON object containing fields to be updated.
 */
router.put('/:id', authenticate, updateUserData);

/**
 * Route: GET /:id/recommendations
 * Description: Fetch game recommendations for a user by ID.
 * Middleware: Requires authentication.
 * URL Parameters:
 * - id: The ID of the user for whom recommendations are requested.
 */
router.get('/:id/recommendations', authenticate, getRecommendations);

// Commented-out legacy or internal-use routes for reference
// These routes are for internal testing purposes only.
// Do not uncomment or expose them publicly, as these methods are intended for server-side use only.

/*
router.post('/', createUserData); // Create new user data (internal use only)
router.delete('/:id', deleteUserData); // Delete user data by ID (internal use only)
*/

export default router;
