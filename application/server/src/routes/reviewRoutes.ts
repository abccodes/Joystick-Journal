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
  const user_id = req.user?.id;

  if (!game_id || !rating || !review_text) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const pool = getPool();
  try {
    const [result] = await pool.query(
      'INSERT INTO reviews (user_id, game_id, rating, review_text) VALUES (?, ?, ?, ?)',
      [user_id, game_id, rating, review_text]
    );

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

/**
 * Route: GET /:id
 * Description: Fetch a review by its ID.
 * Middleware: No authentication required.
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const pool = getPool();
  try {
    const [review] = await pool.query('SELECT * FROM reviews WHERE review_id = ?', [id]);

    if (!review || review.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json({ message: 'Review fetched successfully', review: review[0] });
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

/**
 * Route: GET /game/:gameId
 * Description: Fetch all reviews for a specific game by game ID.
 */
router.get('/game/:gameId', async (req, res) => {
  const { gameId } = req.params;

  const pool = getPool();
  try {
    const [reviews] = await pool.query('SELECT * FROM reviews WHERE game_id = ?', [gameId]);

    if (!reviews || reviews.length === 0) {
      return res.status(404).json({ message: 'No reviews found for this game.' });
    }

    res.status(200).json({ message: 'Reviews fetched successfully', reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

/**
 * Route: PUT /:id
 * Description: Update a review by its ID.
 * Middleware: Requires authentication.
 */
router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { rating, review_text } = req.body;
  const user_id = req.user?.id;

  if (!rating || !review_text) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const pool = getPool();
  try {
    const [review] = await pool.query('SELECT * FROM reviews WHERE review_id = ?', [id]);

    if (!review || review[0]?.user_id !== user_id) {
      return res.status(403).json({ message: 'You can only update your own reviews' });
    }

    await pool.query('UPDATE reviews SET rating = ?, review_text = ? WHERE review_id = ?', [
      rating,
      review_text,
      id,
    ]);

    res.status(200).json({ message: 'Review updated successfully' });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

/**
 * Route: DELETE /:id
 * Description: Delete a review by its ID.
 * Middleware: Requires authentication.
 */
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const user_id = req.user?.id;

  const pool = getPool();
  try {
    const [review] = await pool.query('SELECT * FROM reviews WHERE review_id = ?', [id]);

    if (!review || review[0]?.user_id !== user_id) {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    await pool.query('DELETE FROM reviews WHERE review_id = ?', [id]);

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
