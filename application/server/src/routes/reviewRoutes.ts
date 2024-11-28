import { Router } from 'express';
import { getPool } from '../connections/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import {
  createReview,
  getReviewById,
  getReviewByGameId,
  updateReview,
  deleteReview,
} from '../controllers/reviewController';
import { authenticate } from '../middleware/authMiddleware';

declare global {
  namespace Express {
    interface User {
      id: number; // Ensure compatibility with the `User` type in `@types/passport`
    }
  }
}

// Initialize the router
const router = Router();

/**
 * Route: POST /
 * Description: Create a new review for a game.
 * Middleware: Requires authentication.
 */
router.post('/', authenticate, async (req, res) => {
  const { game_id, rating, review_text } = req.body;
  const user_id = req.user?.id;

  if (!user_id || !game_id || !rating || !review_text) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const pool = getPool();
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO reviews (user_id, game_id, rating, review_text) VALUES (?, ?, ?, ?)',
      [user_id, game_id, rating, review_text]
    );

    if (result.insertId) {
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
 * Route: PUT /:id
 * Description: Update a review by its ID.
 * Middleware: Requires authentication.
 */
router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { rating, review_text } = req.body;
  const user_id = req.user?.id;

  if (!user_id || !rating || !review_text) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const pool = getPool();
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM reviews WHERE review_id = ?',
      [id]
    );

    if (rows.length === 0 || rows[0]?.user_id !== user_id) {
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

  if (!user_id) {
    return res.status(403).json({ message: 'You can only delete your own reviews' });
  }

  const pool = getPool();
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM reviews WHERE review_id = ?',
      [id]
    );

    if (rows.length === 0 || rows[0]?.user_id !== user_id) {
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
