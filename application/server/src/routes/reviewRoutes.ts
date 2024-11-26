import { Router } from 'express';
import { getPool } from '../connections/database';
import {
  createReview,
  getReviewById,
  getReviewByGameId,
  updateReview,
  deleteReview,
} from '../controllers/reviewController';
import { authenticate } from '../middleware/authMiddleware';

// Initialize the router
const router = Router();

/**
 * Route: POST /
 * Description: Create a new review for a game.
 * Middleware: Requires authentication.
 * Request Body:
 * - game_id: The ID of the game being reviewed (number).
 * - rating: The rating given by the user (number).
 * - review_text: The review content provided by the user (string).
 * Response:
 * - 201: Review created successfully with the new review ID.
 * - 400: Missing required fields.
 * - 500: Internal server error.
 */
router.post('/', authenticate, async (req, res) => {
  const { game_id, rating, review_text } = req.body;
  const user_id = req.user?.id; // Ensure `authenticate` middleware adds `user` to `req`.

  // Validate required fields
  if (!game_id || !rating || !review_text) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const pool = getPool();
  try {
    // Explicitly type the query result for TypeScript compatibility
    const [result]: any = await pool.query(
      'INSERT INTO reviews (user_id, game_id, rating, review_text) VALUES (?, ?, ?, ?)',
      [user_id, game_id, rating, review_text]
    );

    // Check if insertId exists in the result (depends on query response type)
    if (result?.insertId) {
      res.status(201).json({ message: 'Review created successfully', reviewId: result.insertId });
    } else {
      throw new Error('Review creation failed: insertId missing');
    }
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Database error', error });
  }
});

// Commented-out legacy code for reference
/**
 * Route: POST /
 * Description: Create a new review using the createReview controller.
 * Status: Legacy, replaced with inline logic for debugging clarity.
 */
// router.post('/', authenticate, createReview);

/**
 * Route: GET /:id
 * Description: Fetch a review by its ID.
 * Status: Legacy, not currently in use.
 */
// router.get('/:id', getReviewById);

/**
 * Route: GET /game/:gameId
 * Description: Fetch all reviews for a specific game by game ID.
 * Status: Legacy, not currently in use.
 */
// router.get('/game/:gameId', getReviewByGameId);

/**
 * Route: PUT /:id
 * Description: Update a review by its ID.
 * Status: Legacy, not currently in use.
 */
// router.put('/:id', authenticate, updateReview);

/**
 * Route: DELETE /:id
 * Description: Delete a review by its ID.
 * Status: Legacy, not currently in use.
 */
// router.delete('/:id', authenticate, deleteReview);

export default router;
